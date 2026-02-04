"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { createGuest } from "@/lib/api/guests";
import type { GuestCreateInput } from "@/types/guest";

export default function NewGuestPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GuestCreateInput>({
    phone: "",
    name: "",
    birthday: null,
    preferences: null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    try {
      await createGuest(accessToken, {
        phone: form.phone.trim(),
        name: (form.name ?? "").trim() || null,
        birthday: form.birthday?.trim() || null,
        preferences: form.preferences ?? null,
      });
      toast.success("Гость добавлен");
      router.push("/dashboard/guests");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/guests"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Гости
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Новый гость
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Телефон <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="+992 90 123 45 67"
          />
        </div>
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Имя
          </label>
          <input
            id="name"
            type="text"
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Имя гостя"
          />
        </div>
        <div>
          <label
            htmlFor="birthday"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            День рождения
          </label>
          <input
            id="birthday"
            type="date"
            value={form.birthday ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, birthday: e.target.value || null }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Сохранение…" : "Сохранить"}
          </button>
          <Link
            href="/dashboard/guests"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Отмена
          </Link>
        </div>
      </form>
    </>
  );
}
