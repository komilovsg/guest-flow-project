"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  arrivedBooking,
  fetchBookings,
} from "@/lib/api/bookings";
import type { Booking } from "@/types/booking";

const STATUS_LABELS: Record<Booking["status"], string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  arrived: "Пришёл",
  completed: "Завершена",
  cancelled: "Отменена",
  no_show: "Не пришёл",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 10);
  });

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await fetchBookings(accessToken, {
        date_from: dateFrom,
        date_to: dateTo,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(
    id: string,
    action: "confirm" | "arrived" | "complete" | "cancel"
  ) {
    if (!accessToken) return;
    try {
      switch (action) {
        case "confirm":
          await confirmBooking(accessToken, id);
          break;
        case "arrived":
          await arrivedBooking(accessToken, id);
          break;
        case "complete":
          await completeBooking(accessToken, id);
          break;
        case "cancel":
          if (!confirm("Отменить бронь?")) return;
          await cancelBooking(accessToken, id);
          break;
      }
      toast.success(
        action === "confirm"
          ? "Бронь подтверждена"
          : action === "arrived"
            ? "Гость отмечен как пришедший"
            : action === "complete"
              ? "Визит завершён"
              : "Бронь отменена"
      );
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка действия");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Журнал броней
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Дата с"
          />
          <span className="text-zinc-500">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Дата по"
          />
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-l-lg px-3 py-2 text-sm font-medium ${
                view === "list"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Список
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-r-lg px-3 py-2 text-sm font-medium ${
                view === "grid"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Сетка
            </button>
          </div>
          <Link
            href="/dashboard/bookings/new"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Новая бронь
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-500 dark:text-zinc-400">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Нет броней за выбранный период.
          </p>
          <Link
            href="/dashboard/bookings/new"
            className="mt-2 inline-block text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Создать бронь
          </Link>
        </div>
      ) : view === "list" ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Дата и время
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Гость
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Стол
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Статус
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {formatDateTime(b.booked_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {b.guest?.name ?? b.guest_id}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.table?.name ?? (b.table_id || "—")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : b.status === "cancelled" || b.status === "no_show"
                            ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            : b.status === "arrived"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "new" && (
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "confirm")}
                        className="mr-2 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        Подтвердить
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "arrived")}
                        className="mr-2 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        Пришёл
                      </button>
                    )}
                    {b.status === "arrived" && (
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "complete")}
                        className="mr-2 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        Завершить
                      </button>
                    )}
                    {["new", "confirmed"].includes(b.status) && (
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "cancel")}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Отменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatDateTime(b.booked_at)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {b.guest?.name ?? b.guest_id} · {b.guests_count} чел.
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Стол: {b.table?.name ?? "—"}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  b.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : b.status === "cancelled" || b.status === "no_show"
                      ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {STATUS_LABELS[b.status]}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {b.status === "new" && (
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, "confirm")}
                    className="text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Подтвердить
                  </button>
                )}
                {b.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, "arrived")}
                    className="text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Пришёл
                  </button>
                )}
                {b.status === "arrived" && (
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, "complete")}
                    className="text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Завершить
                  </button>
                )}
                {["new", "confirmed"].includes(b.status) && (
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, "cancel")}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
