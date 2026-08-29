"use client";

import { useState } from "react";
import { CheckSquare, FileSpreadsheet, FileText, Square, X } from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";
import {
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
} from "@/lib/export-columns";

interface ExportToolbarProps {
  role: string;
  onExportExcel: (columns: string[]) => void;
  onExportPDF: (columns: string[]) => void;
}

type ExportType = "excel" | "pdf" | null;

export function ExportToolbar({ role, onExportExcel, onExportPDF }: ExportToolbarProps) {
  const [exportType, setExportType] = useState<ExportType>(null);
  const [selected, setSelected] = useState<string[]>(DEFAULT_EXPORT_COLUMNS);

  if (role === "EXECUTIVE") {
    return (
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700">
        บทบาท {ROLE_LABELS[role]}: ดูข้อมูลภาพรวมเท่านั้น ไม่สามารถส่งออกข้อมูลได้
      </div>
    );
  }

  function toggleColumn(key: string) {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  }

  function toggleAll() {
    setSelected((current) =>
      current.length === EXPORT_COLUMNS.length
        ? []
        : EXPORT_COLUMNS.map((column) => column.key)
    );
  }

  function openExport(type: ExportType) {
    setExportType(type);
  }

  function confirmExport() {
    if (exportType === "excel") onExportExcel(selected);
    if (exportType === "pdf") onExportPDF(selected);
    setExportType(null);
  }

  const allSelected = selected.length === EXPORT_COLUMNS.length;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => openExport("excel")}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
      <button
        onClick={() => openExport("pdf")}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>

      {exportType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  เลือกคอลัมน์ที่ต้องการส่งออก
                </h3>
                <p className="text-sm text-gray-500">
                  ส่งออกเป็น {exportType === "excel" ? "Excel" : "PDF"} — เลือกแล้ว {selected.length} คอลัมน์
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExportType(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleAll}
              className="mb-3 inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4 text-kku-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
            </button>

            <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-2">
              {EXPORT_COLUMNS.map((column) => {
                const checked = selected.includes(column.key);
                return (
                  <label
                    key={column.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      checked
                        ? "border-kku-primary bg-kku-primary/5 text-gray-900"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(column.key)}
                      className="h-4 w-4 accent-kku-primary"
                    />
                    {column.label}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setExportType(null)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmExport}
                disabled={selected.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-kku-primary px-4 py-2 text-sm font-medium text-white hover:bg-kku-primary/90 disabled:opacity-50"
              >
                {exportType === "excel" ? (
                  <FileSpreadsheet className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                ดาวน์โหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}