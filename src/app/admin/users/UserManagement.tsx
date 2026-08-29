"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

type Role = "STAFF" | "EXECUTIVE" | "ADMIN";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  faculty: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserForm = Pick<ManagedUser, "id" | "name" | "email" | "role" | "faculty">;

const emptyForm: UserForm = {
  id: "",
  name: "",
  email: "",
  role: "STAFF",
  faculty: null,
};

export function UserManagement({
  protectedEmail,
  initialUsers,
}: {
  protectedEmail: string;
  initialUsers: ManagedUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((user) => {
    const haystack = `${user.id} ${user.name} ${user.email} ${user.faculty ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleUsers = filteredUsers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  function changePage(next: number) {
    setPage(Math.min(Math.max(0, next), totalPages - 1));
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(0);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setIsFormOpen(true);
  }

  function openEdit(user: ManagedUser) {
    setEditingId(user.id);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      faculty: user.faculty,
    });
    setError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (!isSubmitting) setIsFormOpen(false);
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = editingId
        ? `/api/admin/users/${encodeURIComponent(editingId)}`
        : "/api/admin/users";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "ไม่สามารถบันทึกผู้ใช้งานได้");

      const saved = {
        ...payload,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
      } as ManagedUser;
      setUsers((current) =>
        editingId
          ? current.map((user) => (user.id === editingId ? saved : user))
          : [saved, ...current]
      );
      setIsFormOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ไม่สามารถบันทึกผู้ใช้งานได้");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!confirm(`ต้องการลบผู้ใช้ ${user.name} (${user.id}) ใช่หรือไม่?`)) return;

    setError("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "ไม่สามารถลบผู้ใช้งานได้");
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ไม่สามารถลบผู้ใช้งานได้");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ผู้ใช้งานระบบ</h2>
          <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ และกำหนดสิทธิ์การเข้าถึงระบบ</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-kku-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-kku-primary/90"
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="ค้นหารหัส, ชื่อ, อีเมล, คณะ"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-kku-primary focus:ring-2 focus:ring-kku-primary/20"
            />
          </div>
          <span className="whitespace-nowrap text-sm text-gray-500">{filteredUsers.length} ผู้ใช้</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">รหัสบุคลากร</th>
                <th className="px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">คณะ/หน่วยงาน</th>
                <th className="px-4 py-3 font-medium">สิทธิ์</th>
                <th className="px-4 py-3 font-medium">แก้ไขล่าสุด</th>
                <th className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleUsers.map((user) => {
                const isProtected = user.email.toLowerCase() === protectedEmail.toLowerCase();
                return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                    {isProtected && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Super Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.faculty ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(user.updatedAt).toLocaleString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        disabled={isProtected}
                        className="rounded p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`แก้ไข ${user.name}`}
                        title={isProtected ? "ไม่สามารถแก้ไขบัญชี Super Admin" : "แก้ไขผู้ใช้"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user)}
                        disabled={isProtected}
                        className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`ลบ ${user.name}`}
                        title={isProtected ? "ไม่สามารถลบบัญชี Super Admin" : "ลบผู้ใช้"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">ไม่พบผู้ใช้งาน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          total={filteredUsers.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <form onSubmit={saveUser} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</h3>
              <button type="button" onClick={closeForm} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="ปิด">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                รหัสบุคลากร
                <input required disabled={Boolean(editingId)} value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-100" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                อีเมล
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                คณะ/หน่วยงาน
                <input value={form.faculty ?? ""} onChange={(event) => setForm({ ...form, faculty: event.target.value || null })} className="rounded-lg border border-gray-200 px-3 py-2" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                สิทธิ์การใช้งาน
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })} className="rounded-lg border border-gray-200 px-3 py-2">
                  <option value="STAFF">เจ้าหน้าที่ (STAFF)</option>
                  <option value="EXECUTIVE">ผู้บริหาร (EXECUTIVE)</option>
                  <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeForm} disabled={isSubmitting} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">ยกเลิก</button>
              <button type="submit" disabled={isSubmitting} className="rounded-lg bg-kku-primary px-4 py-2 text-sm font-medium text-white hover:bg-kku-primary/90 disabled:opacity-50">{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
