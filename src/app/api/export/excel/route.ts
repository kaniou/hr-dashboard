import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportPersonnelData } from "@/lib/services/analytics.service";
import {
  DEFAULT_EXPORT_COLUMNS,
  resolveExportColumns,
} from "@/lib/export-columns";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { exportTimestamp } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EXECUTIVE") {
    return NextResponse.json({ error: "EXECUTIVE role cannot export data" }, { status: 403 });
  }

  try {
    const data = await exportPersonnelData(session.user.role, session.user.faculty, session.user.division);

    const columnsParam = request.nextUrl.searchParams.get("columns");
    const selected = columnsParam
      ? columnsParam.split(",").map((key) => key.trim()).filter(Boolean)
      : DEFAULT_EXPORT_COLUMNS;
    const columns = resolveExportColumns(selected);

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => {
        const record = row as unknown as Record<string, unknown>;
        const out: Record<string, string | number> = {};
        for (const column of columns) {
          out[column.label] = column.get(record);
        }
        return out;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EXPORT_EXCEL",
        metadata: { faculty: session.user.faculty, division: session.user.division, count: data.length, columns: columns.map((c) => c.key) },
        ipAddress: request.headers.get("x-forwarded-for") ?? "unknown",
      },
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="personnel_export_${exportTimestamp()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}