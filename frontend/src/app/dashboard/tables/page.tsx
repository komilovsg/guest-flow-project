"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  createTable,
  deleteTable,
  fetchTables,
  updateTable,
} from "@/lib/api/tables";
import type { Table, TableCreateInput } from "@/types/table";

export default function TablesPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"none" | "new" | "edit">("none");
  const [editing, setEditing] = useState<Table | null>(null);
  const [form, setForm] = useState<TableCreateInput>({
    name: "",
    capacity: null,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await fetchTables(accessToken);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm({ name: "", capacity: null, sort_order: items.length });
    setModal("new");
  }

  function openEdit(table: Table) {
    setEditing(table);
    setForm({
      name: table.name,
      capacity: table.capacity ?? null,
      sort_order: table.sort_order,
    });
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    try {
      if (modal === "new") {
        await createTable(accessToken, form);
        toast.success("Стол добавлен");
      } else if (editing) {
        await updateTable(accessToken, editing.id, form);
        toast.success("Изменения сохранены");
      }
      setModal("none");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(table: Table) {
    if (!accessToken || !confirm(`Удалить стол «${table.name}»?`)) return;
    try {
      await deleteTable(accessToken, table.id);
      toast.success("Стол удалён");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Столы
        </h1>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Добавить стол
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500 dark:text-zinc-400">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Столы не добавлены. Создайте первый стол.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-2 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Добавить стол
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Название
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Вместимость
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Порядок
                </th>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((table) => (
                <tr
                  key={table.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {table.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {table.capacity ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {table.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(table)}
                      className="mr-3 font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(table)}
                      className="font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "new" || modal === "edit") && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-form-title"
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 id="table-form-title" className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {modal === "new" ? "Новый стол" : "Редактирование стола"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="table-name"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  id="table-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Стол 1"
                />
              </div>
              <div>
                <label
                  htmlFor="table-capacity"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Вместимость
                </label>
                <input
                  id="table-capacity"
                  type="number"
                  min={1}
                  value={form.capacity ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      capacity: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="4"
                />
              </div>
              <div>
                <label
                  htmlFor="table-sort"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Порядок
                </label>
                <input
                  id="table-sort"
                  type="number"
                  min={0}
                  value={form.sort_order ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number(e.target.value) || 0,
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
                  {saving ? "Сохранение…" : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModal("none");
                    setEditing(null);
                    setFormError(null);
                  }}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
