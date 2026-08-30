import {
  queryHR,
  getAllPersonnel,
  getPersonnelByFaculty,
  getPersonnelByDivision,
  getPersonnelCounts,
  getPersonnelCountsByFaculty,
  getDistinctFaculties,
  getDistinctColumnValues,
} from "@/lib/db/mysql";

export interface GenerationDistribution {
  generation: string;
  count: number;
}

export interface PositypeDistribution {
  positype: string;
  count: number;
}

export interface WorklineDistribution {
  workline: string;
  count: number;
}

export interface SalaryRange {
  range: string;
  count: number;
}

export interface FacultyDistribution {
  faculty: string;
  count: number;
}

export interface DashboardMetrics {
  total: number;
  male: number;
  female: number;
  generations: GenerationDistribution[];
  positypes: PositypeDistribution[];
  worklines: WorklineDistribution[];
  salaryRanges: SalaryRange[];
  faculties: FacultyDistribution[];
}

export interface DashboardFilters {
  positype?: string;
  workline?: string;
  faculty?: string;
  division?: string;
  gender?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface FilterOptions {
  positypes: string[];
  worklines: string[];
  faculties: string[];
  divisions: string[];
  genders: string[];
}

export function calculateGeneration(birthday: Date | null): string {
  if (!birthday) return "ไม่ระบุ";
  const year = new Date(birthday).getFullYear();
  if (year >= 1946 && year <= 1964) return "Baby Boomer";
  if (year >= 1965 && year <= 1980) return "Gen X";
  if (year >= 1981 && year <= 1996) return "Gen Y / Millennials";
  if (year >= 1997 && year <= 2012) return "Gen Z";
  if (year > 2012) return "Gen Alpha";
  return "ก่อน Baby Boomer";
}

export function calculateSalaryRange(salary: number): string {
  if (salary < 20000) return "< 20,000";
  if (salary <= 40000) return "20,001 - 40,000";
  if (salary <= 60000) return "40,001 - 60,000";
  if (salary <= 80000) return "60,001 - 80,000";
  return "> 80,000";
}

function normalizeGender(gender: string): "ชาย" | "หญิง" | null {
  const g = (gender || "").toUpperCase();
  if (g === "M" || g === "MALE" || gender === "ชาย") return "ชาย";
  if (g === "F" || g === "FEMALE" || gender === "หญิง") return "หญิง";
  return null;
}

interface PersonnelRow {
  birthday: Date | null;
  positype: string;
  workline: string;
  salary: number;
  faculty: string;
  division: string;
  gender: string;
}

function computeMetrics(rows: PersonnelRow[]): DashboardMetrics {
  const genMap = new Map<string, number>();
  const posiMap = new Map<string, number>();
  const wlMap = new Map<string, number>();
  const salaryMap = new Map<string, number>();
  const facMap = new Map<string, number>();
  let male = 0;
  let female = 0;

  for (const row of rows) {
    const gen = calculateGeneration(row.birthday);
    genMap.set(gen, (genMap.get(gen) || 0) + 1);

    const positype = row.positype || "ไม่ระบุ";
    posiMap.set(positype, (posiMap.get(positype) || 0) + 1);

    const workline = row.workline || "ไม่ระบุ";
    wlMap.set(workline, (wlMap.get(workline) || 0) + 1);

    const salaryRange = calculateSalaryRange(row.salary);
    salaryMap.set(salaryRange, (salaryMap.get(salaryRange) || 0) + 1);

    const faculty = row.faculty || "ไม่ระบุ";
    facMap.set(faculty, (facMap.get(faculty) || 0) + 1);

    const gender = normalizeGender(row.gender);
    if (gender === "ชาย") male++;
    else if (gender === "หญิง") female++;
  }

  return {
    total: rows.length,
    male,
    female,
    generations: Array.from(genMap.entries()).map(([generation, count]) => ({
      generation,
      count,
    })),
    positypes: Array.from(posiMap.entries()).map(([positype, count]) => ({
      positype,
      count,
    })),
    worklines: Array.from(wlMap.entries()).map(([workline, count]) => ({
      workline,
      count,
    })),
    salaryRanges: Array.from(salaryMap.entries()).map(([range, count]) => ({
      range,
      count,
    })),
    faculties: Array.from(facMap.entries()).map(([faculty, count]) => ({
      faculty,
      count,
    })),
  };
}

export async function getDashboardMetrics(
  role: string,
  faculty: string | null,
  division: string | null,
  filters: DashboardFilters = {}
): Promise<DashboardMetrics> {
  const personnel = await getScopedPersonnel(role, faculty, division);

  return computeMetrics(applyFilters(personnel, filters));
}

async function getScopedPersonnel(
  role: string,
  faculty: string | null,
  division: string | null
): Promise<PersonnelRow[]> {
  if (role === "STAFF") {
    if (faculty && division) {
      return getPersonnelByDivision(faculty, division);
    }
    if (faculty) {
      return getPersonnelByFaculty(faculty);
    }
  }
  return getAllPersonnel();
}

function applyFilters(
  rows: PersonnelRow[],
  filters: DashboardFilters
): PersonnelRow[] {
  return rows.filter((row) => {
    if (filters.positype && row.positype !== filters.positype) return false;
    if (filters.workline && row.workline !== filters.workline) return false;
    if (filters.faculty && row.faculty !== filters.faculty) return false;
    if (filters.division && row.division !== filters.division) return false;
    if (filters.gender && normalizeGender(row.gender) !== filters.gender) return false;
    if (filters.salaryMin != null && row.salary < filters.salaryMin) return false;
    if (filters.salaryMax != null && row.salary > filters.salaryMax) return false;
    return true;
  });
}

export async function getFilterOptions(
  role: string,
  faculty: string | null
): Promise<FilterOptions> {
  const [positypes, worklines, faculties, divisions] = await Promise.all([
    getDistinctColumnValues("positype"),
    getDistinctColumnValues("workline"),
    getDistinctColumnValues("faculty"),
    getDistinctColumnValues("division"),
  ]);

  return {
    positypes,
    worklines,
    faculties,
    divisions,
    genders: ["ชาย", "หญิง"],
  };
}

export async function getPersonnelData(
  role: string,
  faculty: string | null,
  division: string | null
) {
  return getScopedPersonnel(role, faculty, division);
}

export async function exportPersonnelData(
  role: string,
  faculty: string | null,
  division: string | null
) {
  if (role === "EXECUTIVE") {
    throw new Error("EXECUTIVE role cannot export data");
  }

  return getScopedPersonnel(role, faculty, division);
}