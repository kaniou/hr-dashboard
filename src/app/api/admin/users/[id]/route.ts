import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roles = new Set<Role>(["STAFF", "EXECUTIVE", "ADMIN"]);

const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL ?? "kaniou@kku.ac.th").toLowerCase();

function isAdmin(session: Session | null) {
  return session?.user?.role === "ADMIN";
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const faculty = typeof body.faculty === "string" ? body.faculty.trim() || null : null;
  const role = body.role as Role;

  if (!name || !email || !roles.has(role)) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Cannot modify the super admin account" }, { status: 403 });
  }

  const emailOwner = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (emailOwner && emailOwner.id !== id) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, faculty },
    });

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "UPDATE_USER",
        metadata: { targetUserId: user.id, role: user.role },
        ipAddress: request.headers.get("x-forwarded-for") ?? null,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Cannot delete the super admin account" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
    prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "DELETE_USER",
        metadata: { targetUserId: user.id, email: user.email, role: user.role },
        ipAddress: request.headers.get("x-forwarded-for") ?? null,
      },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
