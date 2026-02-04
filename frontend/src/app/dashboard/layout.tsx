"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/dashboard", label: "Главная" },
  { href: "/dashboard/guests", label: "Гости" },
  { href: "/dashboard/tables", label: "Столы" },
  { href: "/dashboard/bookings", label: "Журнал броней" },
];

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, isInitialized, logout } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
  }, [isInitialized, accessToken, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Загрузка…</p>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-full flex-col">
          <Link
            href="/dashboard"
            className="border-b border-zinc-200 px-4 py-4 text-lg font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
          >
            GuestFlow
          </Link>
          <nav className="flex-1 space-y-0.5 p-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
            <p className="truncate px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400">
              {user?.email ?? ""}
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardErrorBoundary>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardErrorBoundary>
  );
}
