"use client";

import { useState } from "react";

interface PersonnelRow {
  emp_id: string;
  firstname: string;
  lastname: string;
  position_name: string;
  faculty: string;
  division: string;
  workline: string;
  salary: number;
  gender: string;
}

interface PersonnelTableProps {
  data: PersonnelRow[];
}

export function PersonnelTable({ data }: PersonnelTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          ข้อมูลบุคลากร ({data.length.toLocaleString()} รายการ)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">รหัส</th>
              <th className="text-left px-4 py-2 font-medium">ชื่อ-นามสกุล</th>
              <th className="text-left px-4 py-2 font-medium">ตำแหน่ง</th>
              <th className="text-left px-4 py-2 font-medium">คณะ/หน่วยงาน</th>
              <th className="text-left px-4 py-2 font-medium">ฝ่าย</th>
              <th className="text-left px-4 py-2 font-medium">สายงาน</th>
              <th className="text-right px-4 py-2 font-medium">เงินเดือน</th>
              <th className="text-center px-4 py-2 font-medium">เพศ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.map((row) => (
              <tr key={row.emp_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{row.emp_id}</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {row.firstname} {row.lastname}
                </td>
                <td className="px-4 py-2 text-gray-600">{row.position_name}</td>
                <td className="px-4 py-2 text-gray-600">{row.faculty}</td>
                <td className="px-4 py-2 text-gray-600">{row.division}</td>
                <td className="px-4 py-2 text-gray-600">{row.workline}</td>
                <td className="px-4 py-2 text-right font-mono text-gray-700">
                  {row.salary?.toLocaleString() ?? "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      row.gender === "M" || row.gender === "Male" || row.gender === "ชาย"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-pink-100 text-pink-700"
                    }`}
                  >
                    {row.gender === "M" || row.gender === "Male" || row.gender === "ชาย"
                      ? "ชาย"
                      : "หญิง"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t flex items-center justify-between text-sm">
          <span className="text-gray-500">
            หน้า {page + 1} จาก {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}