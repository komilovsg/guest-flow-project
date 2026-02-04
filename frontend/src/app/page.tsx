import Link from "next/link";

const METRICS = [
  { value: "500+", label: "Ресторанов на платформе" },
  { value: "50K+", label: "Гостей в базах" },
  { value: "120K+", label: "Броней в месяц" },
  { value: "98%", label: "Довольных хостес" },
];

const FEATURES = [
  {
    title: "Единая база гостей",
    description: "Телефон, история визитов, предпочтения — всё в одном месте. Без дублей и потери контактов.",
  },
  {
    title: "Умное бронирование",
    description: "Календарь столов, защита от наложений, напоминания гостям и чекин в один клик.",
  },
  {
    title: "Бот в Telegram",
    description: "Свой бот для ресторана: гости бронируют и пишут отзывы, вы управляете из панели.",
  },
  {
    title: "Рассылки по сегментам",
    description: "Кто не был больше 10 дней, новички, лояльные — отправляйте акции тем, кому важно.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0f1a] font-sans text-white antialiased">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <span className="text-xl font-bold tracking-tight text-white">
            Guest<span className="text-emerald-400">Flow</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              Войти
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-24 text-center md:pt-28 md:pb-32">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400/90">
            CRM и бронирования для ресторанов
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Один сервис для гостей,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              броней и бота
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Панель хостес, Telegram-бот под ваш ресторан, напоминания, отзывы и рассылки — без хаоса и потерянных контактов.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              Войти в панель
            </Link>
            <a
              href="#metrics"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Смотреть метрики
            </a>
          </div>
        </section>

        {/* Metrics */}
        <section
          id="metrics"
          className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-2xl font-bold text-white md:text-3xl">
              В цифрах
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {METRICS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.07]"
                >
                  <div className="text-3xl font-bold text-emerald-400 md:text-4xl">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h2 className="mb-14 text-center text-2xl font-bold text-white md:text-3xl">
            Что умеет GuestFlow
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-emerald-500/20 hover:bg-white/[0.06]"
              >
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 md:pb-32">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-10 text-center md:p-14">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Готовы упростить работу с гостями?
            </h2>
            <p className="mt-3 text-zinc-400">
              Войдите в панель и начните управлять бронированиями и базой гостей.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
            >
              Войти в GuestFlow
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
          GuestFlow — CRM и бронирования для ресторанов. Душанбе и не только.
        </div>
      </footer>
    </div>
  );
}
