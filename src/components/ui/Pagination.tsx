"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [10, 15, 20, 50];

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>
          แสดง {start.toLocaleString()}–{end.toLocaleString()} จาก {total.toLocaleString()} รายการ
        </span>
        <label className="flex items-center gap-1">
          ต่อหน้า
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-kku-primary"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          ก่อนหน้า
        </button>
        <span className="text-sm text-gray-600">
          หน้า {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}