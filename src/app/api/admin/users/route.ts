import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roles = new Set<Role>(["STAFF", "EXECUTIVE", "ADMIN"]);

function isAdmin(session: Session | null) {
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      faculty: true,
      division: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const faculty = typeof body.faculty === "string" ? body.faculty.trim() || null : null;
  const division = typeof body.division === "string" ? body.division.trim() || null : null;
  const role = body.role as Role;

  if (!id || !name || !email || !roles.has(role)) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ id }, { email }] },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Employee ID or email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { id, name, email, role, faculty, division },
  });

  await prisma.auditLog.create({
    data: {
      userId: session!.user.id,
      action: "CREATE_USER",
      metadata: { targetUserId: user.id, role: user.role },
      ipAddress: request.headers.get("x-forwarded-for") ?? null,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
