"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  type PieLabelRenderProps,
} from "recharts";
import { CHART_COLORS } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

interface GenerationChartProps {
  data: { generation: string; count: number }[];
}

export function GenerationChart({ data }: GenerationChartProps) {
  return (
    <ChartCard title="ช่วงอายุ (Generation)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="generation" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="จำนวน" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface PositypeChartProps {
  data: { positype: string; count: number }[];
}

export function PositypeChart({ data }: PositypeChartProps) {
  return (
    <ChartCard title="ประเภทบุคลากร">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="positype"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            label={(entry: PieLabelRenderProps) => {
                const name = entry.name;
                const value = entry.value;
                return name && value !== undefined ? `${name}: ${value}` : "";
              }}
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface WorklineChartProps {
  data: { workline: string; count: number }[];
}

export function WorklineChart({ data }: WorklineChartProps) {
  return (
    <ChartCard title="สายงาน">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="workline" type="category" tick={{ fontSize: 11 }} width={140} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} name="จำนวน" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface SalaryChartProps {
  data: { range: string; count: number }[];
}

const SALARY_ORDER = [
  "< 20,000",
  "20,001 - 40,000",
  "40,001 - 60,000",
  "60,001 - 80,000",
  "> 80,000",
];

export function SalaryChart({ data }: SalaryChartProps) {
  const sorted = SALARY_ORDER.map(
    (r) => data.find((d) => d.range === r) ?? { range: r, count: 0 }
  );

  return (
    <ChartCard title="ช่วงเงินเดือน">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="count" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} name="จำนวน" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}