import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportPersonnelData } from "@/lib/services/analytics.service";
import {
  DEFAULT_EXPORT_COLUMNS,
  resolveExportColumns,
} from "@/lib/export-columns";
import { prisma } from "@/lib/prisma";
import { exportTimestamp } from "@/lib/utils";
import { jsPDF } from "jspdf";
import { registerThaiFonts, THAI_FONT } from "@/lib/pdf-font";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EXECUTIVE") {
    return NextResponse.json({ error: "EXECUTIVE role cannot export data" }, { status: 403 });
  }

  try {
    const data = await exportPersonnelData(session.user.role, session.user.faculty);

    const columnsParam = request.nextUrl.searchParams.get("columns");
    const selected = columnsParam
      ? columnsParam.split(",").map((key) => key.trim()).filter(Boolean)
      : DEFAULT_EXPORT_COLUMNS;
    const columns = resolveExportColumns(selected);

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    registerThaiFonts(doc);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;

    doc.setFont(THAI_FONT, "bold");
    doc.setFontSize(16);
    doc.text("KKU Personnel Report", margin, 20);

    doc.setFont(THAI_FONT, "normal");
    doc.setFontSize(10);
    doc.text(
      `Exported: ${new Date().toLocaleString("th-TH")} | Records: ${data.length}`,
      margin,
      28
    );

    // Compute column widths based on header label length, normalized to fit page.
    const rawWidths = columns.map((column) =>
      Math.max(18, Math.min(55, column.label.length * 2.4))
    );
    const rawTotal = rawWidths.reduce((sum, width) => sum + width, 0);
    const scale = rawTotal > usableWidth ? usableWidth / rawTotal : 1;
    const colWidths = rawWidths.map((width) => width * scale);

    const rows = data.map((row) => {
      const record = row as unknown as Record<string, unknown>;
      return columns.map((column) => column.get(record));
    });

    let y = 36;
    doc.setFont(THAI_FONT, "bold");
    doc.setFontSize(8);
    let x = margin;
    columns.forEach((column, index) => {
      doc.text(column.label, x, y);
      x += colWidths[index];
    });

    y += 6;
    doc.setFont(THAI_FONT, "normal");
    doc.setFontSize(7);

    for (const row of rows) {
      if (y > pageHeight - 10) {
        doc.addPage();
        y = 14;
      }
      x = margin;
      row.forEach((cell, index) => {
        const maxChars = Math.max(4, Math.floor(colWidths[index] / 2.4));
        const text = String(cell).substring(0, maxChars);
        doc.text(text, x, y);
        x += colWidths[index];
      });
      y += 5;
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EXPORT_PDF",
        metadata: { faculty: session.user.faculty, count: data.length, columns: columns.map((c) => c.key) },
        ipAddress: request.headers.get("x-forwarded-for") ?? "unknown",
      },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="personnel_export_${exportTimestamp()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}