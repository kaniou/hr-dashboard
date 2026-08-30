import { auth } from "@/lib/auth";
import {
  getDashboardMetrics,
  getFilterOptions,
  type DashboardFilters,
} from "@/lib/services/analytics.service";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { GenerationChart, PositypeChart, WorklineChart, SalaryChart } from "@/components/dashboard/Charts";
import { FacultyChart } from "@/components/dashboard/FacultyChart";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ExportButtons } from "./ExportButtons";

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toString(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw == null || raw === "" ? undefined : raw;
}

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { role, faculty, division } = session.user;
  const params = await searchParams;

  const filters: DashboardFilters = {
    positype: toString(params.positype),
    workline: toString(params.workline),
    faculty: toString(params.faculty),
    division: toString(params.division),
    gender: toString(params.gender),
    salaryMin: toNumber(params.salaryMin),
    salaryMax: toNumber(params.salaryMax),
  };

  const [metrics, options] = await Promise.all([
    getDashboardMetrics(role, faculty, division, filters),
    getFilterOptions(role, faculty),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard ข้อมูลบุคลากร</h2>
            <p className="text-sm text-gray-500">
              {role === "STAFF" && faculty
                ? `คณะ/หน่วยงาน: ${faculty}${division ? ` | ฝ่าย: ${division}` : ""}`
                : "ภาพรวมมหาวิทยาลัย"}
            </p>
          </div>
          <ExportButtons role={role} faculty={faculty} division={division} />
        </div>

        <FilterBar role={role} options={options} filters={filters} />

        <SummaryCards
          total={metrics.total}
          male={metrics.male}
          female={metrics.female}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenerationChart data={metrics.generations} />
          <PositypeChart data={metrics.positypes} />
          <WorklineChart data={metrics.worklines} />
          <SalaryChart data={metrics.salaryRanges} />
        </div>

        {role !== "STAFF" && metrics.faculties.length > 1 && (
          <FacultyChart data={metrics.faculties} />
        )}
      </main>
    </div>
  );
}