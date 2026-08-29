export interface ExportColumn {
  key: string;
  label: string;
  get: (row: Record<string, unknown>) => string | number;
}

function dateValue(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  const str = String(value);
  return str.split("T")[0];
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

export const EXPORT_COLUMNS: ExportColumn[] = [
  { key: "emp_id", label: "รหัสพนักงาน", get: (r) => text(r.emp_id) },
  { key: "firstname", label: "ชื่อ", get: (r) => text(r.firstname) },
  { key: "lastname", label: "นามสกุล", get: (r) => text(r.lastname) },
  { key: "title_eng", label: "คำนำหน้า (อังกฤษ)", get: (r) => text(r.title_eng) },
  { key: "firstname_eng", label: "ชื่อ (อังกฤษ)", get: (r) => text(r.firstname_eng) },
  { key: "lastname_eng", label: "นามสกุล (อังกฤษ)", get: (r) => text(r.lastname_eng) },
  { key: "gender", label: "เพศ", get: (r) => text(r.gender) },
  { key: "birthday", label: "วันเกิด", get: (r) => dateValue(r.birthday) },
  { key: "position_name", label: "ตำแหน่ง", get: (r) => text(r.position_name) },
  { key: "level_name", label: "ระดับ", get: (r) => text(r.level_name) },
  { key: "positype", label: "ประเภทบุคลากร", get: (r) => text(r.positype) },
  { key: "workline", label: "สายงาน", get: (r) => text(r.workline) },
  { key: "rate", label: "อัตรา", get: (r) => text(r.rate) },
  { key: "salary", label: "เงินเดือน", get: (r) => Number(r.salary ?? 0) },
  { key: "salary_type", label: "ประเภทเงินเดือน", get: (r) => text(r.salary_type) },
  { key: "faculty", label: "คณะ/หน่วยงาน", get: (r) => text(r.faculty) },
  { key: "division", label: "ฝ่าย", get: (r) => text(r.division) },
  { key: "job", label: "งาน", get: (r) => text(r.job) },
  { key: "unit_name", label: "หน่วยงาน", get: (r) => text(r.unit_name) },
  { key: "subunit", label: "หน่วยงานย่อย", get: (r) => text(r.subunit) },
  { key: "block_name", label: "สังกัด", get: (r) => text(r.block_name) },
  { key: "putday", label: "วันที่บรรจุ", get: (r) => dateValue(r.putday) },
  { key: "retireday", label: "วันที่เกษียณ", get: (r) => dateValue(r.retireday) },
  { key: "email", label: "อีเมล", get: (r) => text(r.email) },
];

export const DEFAULT_EXPORT_COLUMNS = [
  "emp_id",
  "firstname",
  "lastname",
  "position_name",
  "faculty",
  "division",
  "workline",
  "positype",
  "salary",
  "gender",
  "email",
];

export function resolveExportColumns(selected: string[]): ExportColumn[] {
  const order = new Map(EXPORT_COLUMNS.map((column, index) => [column.key, index]));
  return selected
    .map((key) => EXPORT_COLUMNS.find((column) => column.key === key))
    .filter((column): column is ExportColumn => Boolean(column))
    .sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
}
