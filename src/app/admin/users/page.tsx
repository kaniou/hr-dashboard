import Link from "next/link";
import { ArrowLeft, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagement } from "./UserManagement";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      faculty: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-500 transition-colors hover:text-gray-900"
              aria-label="กลับไป dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-kku-primary" />
              <h1 className="text-lg font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
            </div>
          </div>
          <Link href="/admin/logs" className="text-sm text-kku-primary hover:underline">
            Audit Logs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <UserManagement
          protectedEmail={process.env.SUPER_ADMIN_EMAIL ?? "kaniou@kku.ac.th"}
          initialUsers={users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
