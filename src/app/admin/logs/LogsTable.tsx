"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

type LogRow = {
  id: string;
  userId: string;
  action: string;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string;
    role: string;
    faculty: string | null;
  } | null;
};

function actionBadge(action: string) {
  if (action === "LOGIN") return "bg-blue-100 text-blue-700";
  if (action === "EXPORT_EXCEL") return "bg-green-100 text-green-700";
  if (action === "EXPORT_PDF") return "bg-red-100 text-red-700";
  if (action.startsWith("CREATE")) return "bg-emerald-100 text-emerald-700";
  if (action.startsWith("UPDATE")) return "bg-amber-100 text-amber-700";
  if (action.startsWith("DELETE")) return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-700";
}

export function LogsTable({ initialLogs }: { initialLogs: LogRow[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [query, setQuery] = useState("");

  const filteredLogs = initialLogs.filter((log) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = `${log.user?.name ?? ""} ${log.userId} ${log.action} ${log.user?.role ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleLogs = filteredLogs.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  function changePage(next: number) {
    setPage(Math.min(Math.max(0, next), totalPages - 1));
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(0);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="ค้นหาชื่อผู้ใช้, การกระทำ, บทบาท"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
          />
        </div>
        <span className="whitespace-nowrap text-sm text-gray-500">{filteredLogs.length} รายการ</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">เวลา</th>
              <th className="text-left px-4 py-2 font-medium">ผู้ใช้</th>
              <th className="text-left px-4 py-2 font-medium">การกระทำ</th>
              <th className="text-left px-4 py-2 font-medium">บทบาท</th>
              <th className="text-left px-4 py-2 font-medium">รายละเอียด</th>
              <th className="text-left px-4 py-2 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 text-gray-500 text-xs">
                  {new Date(log.createdAt).toLocaleString("th-TH")}
                </td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {log.user?.name ?? log.userId}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionBadge(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {log.user?.role ?? "-"}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {log.metadata ? JSON.stringify(log.metadata) : "-"}
                </td>
                <td className="px-4 py-2 text-xs text-gray-400 font-mono">
                  {log.ipAddress ?? "-"}
                </td>
              </tr>
            ))}
            {visibleLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        total={filteredLogs.length}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}