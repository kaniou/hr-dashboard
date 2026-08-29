"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Filter, Loader2, RotateCcw } from "lucide-react";
import type {
  DashboardFilters,
  FilterOptions,
} from "@/lib/services/analytics.service";

interface FilterBarProps {
  role: string;
  options: FilterOptions;
  filters: DashboardFilters;
}

const GENDER_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "ชาย", label: "ชาย" },
  { value: "หญิง", label: "หญิง" },
];

export function FilterBar({ role, options, filters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [salaryMin, setSalaryMin] = useState<string>(
    filters.salaryMin != null ? String(filters.salaryMin) : "",
  );
  const [salaryMax, setSalaryMax] = useState<string>(
    filters.salaryMax != null ? String(filters.salaryMax) : "",
  );

  function navigate(url: string) {
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function apply(next: DashboardFilters) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value != null && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname);
  }

  function update(key: keyof DashboardFilters, value: string) {
    apply({ ...filters, [key]: value === "" ? undefined : value });
  }

  function applySalary() {
    const next: DashboardFilters = {
      ...filters,
      salaryMin: salaryMin === "" ? undefined : Number(salaryMin),
      salaryMax: salaryMax === "" ? undefined : Number(salaryMax),
    };
    apply(next);
  }

  function clearAll() {
    setSalaryMin("");
    setSalaryMax("");
    navigate(pathname);
  }

  const hasFilters = Object.values(filters).some(
    (value) => value != null && value !== "",
  );

  return (
    <div className="relative bg-white rounded-xl shadow-sm border p-4">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md border">
            <Loader2 className="h-5 w-5 animate-spin text-kku-primary" />
            <span className="text-sm font-medium text-gray-700">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="h-4 w-4 text-kku-primary" />
          ตัวกรองข้อมูล
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-kku-primary" />}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-kku-primary transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">
            ประเภทบุคลากร
          </span>
          <select
            value={filters.positype ?? ""}
            onChange={(event) => update("positype", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
          >
            <option value="">ทั้งหมด</option>
            {options.positypes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">
            สายงาน
          </span>
          <select
            value={filters.workline ?? ""}
            onChange={(event) => update("workline", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
          >
            <option value="">ทั้งหมด</option>
            {options.worklines.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        {role !== "STAFF" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">
              คณะ/หน่วยงาน
            </span>
            <select
              value={filters.faculty ?? ""}
              onChange={(event) => update("faculty", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
            >
              <option value="">ทั้งหมด</option>
              {options.faculties.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">
            ฝ่าย
          </span>
          <select
            value={filters.division ?? ""}
            onChange={(event) => update("division", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
          >
            <option value="">ทั้งหมด</option>
            {options.divisions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">
            เพศ
          </span>
          <select
            value={filters.gender ?? ""}
            onChange={(event) => update("gender", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">
            ช่วงเงินเดือน (บาท)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1000}
              value={salaryMin}
              onChange={(event) => setSalaryMin(event.target.value)}
              onBlur={applySalary}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySalary();
              }}
              placeholder="ต่ำสุด"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={salaryMax}
              onChange={(event) => setSalaryMax(event.target.value)}
              onBlur={applySalary}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySalary();
              }}
              placeholder="สูงสุด"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
