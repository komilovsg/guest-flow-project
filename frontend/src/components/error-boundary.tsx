"use client";

import React from "react";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Произошла ошибка
          </h2>
          <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
            {this.state.error.message}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Попробуйте выйти и войти снова. Если ошибка повторяется — проверьте консоль браузера (F12).
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Перейти к входу
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
