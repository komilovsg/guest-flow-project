"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { fetchGuest, updateGuest } from "@/lib/api/guests";
import type { Guest, GuestUpdateInput } from "@/types/guest";

export default function GuestEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { accessToken } = useAuth();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<GuestUpdateInput>({
    phone: "",
    name: "",
    birthday: null,
  });

  const load = useCallback(async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchGuest(accessToken, id);
      setGuest(data);
      setForm({
        phone: data.phone,
        name: data.name ?? "",
        birthday: data.birthday ?? null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !guest) return;
    setSaving(true);
    try {
      await updateGuest(accessToken, guest.id, {
        phone: form.phone?.trim(),
        name: form.name?.trim() || null,
        birthday: form.birthday?.trim() || null,
      });
      toast.success("Изменения сохранены");
      router.push("/dashboard/guests");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-zinc-500">Загрузка…</p>;
  }

  if (loadError && !guest) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/guests"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Гости
        </Link>
      </div>
    );
  }

  if (!guest) return null;

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
        Редактирование гостя
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
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Визитов: {guest.visit_count}
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Сохранение…" : "Сохранить"}
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
