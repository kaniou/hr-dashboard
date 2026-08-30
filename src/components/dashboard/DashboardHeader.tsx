import { auth } from "@/lib/auth";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/utils";
import Link from "next/link";
import { LogOut, Settings, User, Building2 } from "lucide-react";

export async function DashboardHeader() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-kku-primary text-white p-1.5 rounded">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-kku-primary">
              KKU HR Analytics
            </h1>
            <p className="text-[10px] text-gray-400">Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">
              {session.user.name}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[session.user.role] ?? "bg-gray-100 text-gray-700"}`}
            >
              {ROLE_LABELS[session.user.role] ?? session.user.role}
            </span>
            {session.user.faculty && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                {session.user.faculty}
              </span>
            )}
            {session.user.division && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {session.user.division}
              </span>
            )}
          </div>

          {session.user.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-kku-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">จัดการผู้ใช้</span>
            </Link>
          )}

          <a
            href="/auth/logout"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </a>
        </div>
      </div>
    </header>
  );
}
