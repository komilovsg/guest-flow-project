"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { fetchGuests } from "@/lib/api/guests";
import type { Guest } from "@/types/guest";

export default function GuestsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetchGuests(accessToken, {
        search: search || undefined,
        limit: 50,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, search]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Гости
        </h1>
        <Link
          href="/dashboard/guests/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Добавить гостя
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Поиск по имени или телефону…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          aria-label="Поиск гостей"
        />
      </div>

      {loading ? (
        <p className="text-zinc-500 dark:text-zinc-400">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {search ? "Ничего не найдено." : "Пока нет гостей. Добавьте первого."}
          </p>
          {!search && (
            <Link
              href="/dashboard/guests/new"
              className="mt-2 inline-block text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            >
              Добавить гостя
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Имя
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Телефон
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Визиты
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((guest) => (
                <tr
                  key={guest.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {guest.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {guest.phone}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {guest.visit_count}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/guests/${guest.id}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
