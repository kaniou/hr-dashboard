import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(
    date.getHours(),
  )}_${pad(date.getMinutes())}_${pad(date.getSeconds())}`;
}

export const ROLE_LABELS: Record<string, string> = {
  STAFF: "เจ้าหน้าที่",
  EXECUTIVE: "ผู้บริหาร",
  ADMIN: "ผู้ดูแลระบบ",
};

export const ROLE_COLORS: Record<string, string> = {
  STAFF: "bg-blue-100 text-blue-800",
  EXECUTIVE: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

export const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];