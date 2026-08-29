"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/utils";

interface FacultyChartProps {
  data: { faculty: string; count: number }[];
}

export function FacultyChart({ data }: FacultyChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 15);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">บุคลากรแยกตามคณะ/หน่วยงาน</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 180, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="faculty" type="category" tick={{ fontSize: 10 }} width={170} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="count" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} name="จำนวน" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}