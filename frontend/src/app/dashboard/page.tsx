import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Панель управления
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Обзор ресторана: гости, столы и бронирования.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/guests"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Гости
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            База гостей, поиск и карточки
          </p>
        </Link>
        <Link
          href="/dashboard/tables"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Столы
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Настройка столов зала
          </p>
        </Link>
        <Link
          href="/dashboard/bookings"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Журнал броней
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Сетка и список бронирований
          </p>
        </Link>
      </div>
    </>
  );
}
