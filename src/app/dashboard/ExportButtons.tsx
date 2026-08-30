"use client";

import { ExportToolbar } from "@/components/dashboard/ExportToolbar";

interface ExportButtonsProps {
  role: string;
  faculty: string | null;
  division: string | null;
}

export function ExportButtons({ role, faculty, division }: ExportButtonsProps) {
  const download = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async (columns: string[]) => {
    try {
      const params = new URLSearchParams();
      if (faculty) params.set("faculty", faculty);
      if (division) params.set("division", division);
      params.set("columns", columns.join(","));
      const res = await fetch(`/api/export/excel?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      download(url, `personnel_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const handleExportPDF = async (columns: string[]) => {
    try {
      const params = new URLSearchParams();
      if (faculty) params.set("faculty", faculty);
      if (division) params.set("division", division);
      params.set("columns", columns.join(","));
      const res = await fetch(`/api/export/pdf?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      download(url, `personnel_report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <ExportToolbar
      role={role}
      onExportExcel={handleExportExcel}
      onExportPDF={handleExportPDF}
    />
  );
}