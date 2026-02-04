"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { createBooking } from "@/lib/api/bookings";
import { fetchGuests } from "@/lib/api/guests";
import { fetchTables } from "@/lib/api/tables";
import type { BookingCreateInput } from "@/types/booking";
import type { Guest } from "@/types/guest";
import type { Table } from "@/types/table";

export default function NewBookingPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BookingCreateInput>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const local =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return {
      guest_id: "",
      table_id: null,
      booked_at: local,
      duration_minutes: 90,
      buffer_minutes: 0,
      guests_count: 2,
      source: "manual",
    };
  });

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [gRes, tRes] = await Promise.all([
        fetchGuests(accessToken, { limit: 200 }),
        fetchTables(accessToken),
      ]);
      setGuests(gRes.items);
      setTables(Array.isArray(tRes) ? tRes : []);
    } catch {
      setGuests([]);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !form.guest_id || !form.booked_at) return;
    setSaving(true);
    try {
      const iso = new Date(form.booked_at).toISOString();
      await createBooking(accessToken, {
        ...form,
        guest_id: form.guest_id,
        booked_at: iso,
        table_id: form.table_id || null,
        duration_minutes: form.duration_minutes ?? 90,
        buffer_minutes: form.buffer_minutes ?? 0,
        guests_count: form.guests_count ?? 1,
        source: form.source ?? "manual",
      });
      toast.success("Бронь создана");
      router.push("/dashboard/bookings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-zinc-500">Загрузка…</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/bookings"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Журнал броней
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Новая бронь
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label
            htmlFor="guest_id"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Гость <span className="text-red-500">*</span>
          </label>
          <select
            id="guest_id"
            required
            value={form.guest_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, guest_id: e.target.value }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Выберите гостя</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name || g.phone} ({g.phone})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="booked_at"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Дата и время <span className="text-red-500">*</span>
          </label>
          <input
            id="booked_at"
            type="datetime-local"
            required
            value={form.booked_at}
            onChange={(e) =>
              setForm((f) => ({ ...f, booked_at: e.target.value }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label
            htmlFor="table_id"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Стол
          </label>
          <select
            id="table_id"
            value={form.table_id ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                table_id: e.target.value || null,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Не выбран</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.capacity != null ? `(${t.capacity} чел.)` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="guests_count"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Количество гостей
          </label>
          <input
            id="guests_count"
            type="number"
            min={1}
            value={form.guests_count ?? 1}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                guests_count: Number(e.target.value) || 1,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label
            htmlFor="duration_minutes"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Длительность (мин)
          </label>
          <input
            id="duration_minutes"
            type="number"
            min={15}
            step={15}
            value={form.duration_minutes ?? 90}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                duration_minutes: Number(e.target.value) || 90,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Сохранение…" : "Создать бронь"}
          </button>
          <Link
            href="/dashboard/bookings"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Отмена
          </Link>
        </div>
      </form>
    </>
  );
}
