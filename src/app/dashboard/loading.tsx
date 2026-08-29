import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-md border">
        <Loader2 className="h-5 w-5 animate-spin text-kku-primary" />
        <span className="text-sm font-medium text-gray-700">กำลังโหลดข้อมูล...</span>
      </div>
    </div>
  );
}
