import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogsTable } from "./LogsTable";

export default async function AdminLogsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, role: true, faculty: true },
      },
    },
  });

  const serializedLogs = logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    action: log.action,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Audit Logs</h1>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[session.user.role]}`}
          >
            {ROLE_LABELS[session.user.role]}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <LogsTable initialLogs={serializedLogs} />
      </main>
    </div>
  );
}