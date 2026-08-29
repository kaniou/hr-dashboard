import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "KKU_HCM",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export interface HRPersonnel {
  emp_id: string;
  firstname: string;
  lastname: string;
  title_eng: string;
  firstname_eng: string;
  lastname_eng: string;
  gender: string;
  birthday: Date | null;
  block_name: string;
  workline: string;
  rate: string;
  position_name: string;
  level_name: string;
  positype: string;
  salary: number;
  salary_type: string;
  faculty: string;
  division: string;
  job: string;
  unit_name: string;
  subunit: string;
  putday: Date | null;
  retireday: Date | null;
  email: string;
}

export async function queryHR<T = HRPersonnel>(
  sql: string,
  params?: (string | number | null)[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T[];
}

export async function getPersonnelByFaculty(faculty: string): Promise<HRPersonnel[]> {
  return queryHR<HRPersonnel>(
    "SELECT * FROM KKU_HCM_TO_BI_CURRENT WHERE faculty = ? ORDER BY emp_id",
    [faculty]
  );
}

export async function getAllPersonnel(): Promise<HRPersonnel[]> {
  return queryHR<HRPersonnel>(
    "SELECT * FROM KKU_HCM_TO_BI_CURRENT ORDER BY emp_id"
  );
}

export async function getDistinctFaculties(): Promise<{ faculty: string }[]> {
  return queryHR<{ faculty: string }>(
    "SELECT DISTINCT faculty FROM KKU_HCM_TO_BI_CURRENT WHERE faculty IS NOT NULL AND faculty != '' ORDER BY faculty"
  );
}

const DISTINCT_COLUMNS = new Set([
  "positype",
  "workline",
  "faculty",
  "division",
  "gender",
]);

export async function getDistinctColumnValues(
  column: string
): Promise<string[]> {
  if (!DISTINCT_COLUMNS.has(column)) return [];
  const rows = await queryHR<{ value: string }>(
    `SELECT DISTINCT ${column} AS value FROM KKU_HCM_TO_BI_CURRENT WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column}`
  );
  return rows.map((row) => row.value).filter(Boolean);
}

export async function getPersonnelCounts(): Promise<{
  total: number;
  male: number;
  female: number;
}> {
  const [totalRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT"
  );
  const [maleRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT WHERE gender = 'M' OR gender = 'Male' OR gender = 'ชาย'"
  );
  const [femaleRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT WHERE gender = 'F' OR gender = 'Female' OR gender = 'หญิง'"
  );

  const extract = (r: unknown) =>
    Number((r as { cnt: number }[])[0]?.cnt) || 0;

  return {
    total: extract(totalRows),
    male: extract(maleRows),
    female: extract(femaleRows),
  };
}

export async function getPersonnelCountsByFaculty(
  faculty: string
): Promise<{ total: number; male: number; female: number }> {
  const [totalRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT WHERE faculty = ?",
    [faculty]
  );
  const [maleRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT WHERE faculty = ? AND (gender = 'M' OR gender = 'Male' OR gender = 'ชาย')",
    [faculty]
  );
  const [femaleRows] = await pool.execute(
    "SELECT COUNT(*) as cnt FROM KKU_HCM_TO_BI_CURRENT WHERE faculty = ? AND (gender = 'F' OR gender = 'Female' OR gender = 'หญิง')",
    [faculty]
  );

  const extract = (r: unknown) =>
    Number((r as { cnt: number }[])[0]?.cnt) || 0;

  return {
    total: extract(totalRows),
    male: extract(maleRows),
    female: extract(femaleRows),
  };
}