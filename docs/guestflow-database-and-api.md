# GuestFlow MVP — Схема БД и API endpoints

Документ для проектирования фронтенда и бота: список таблиц БД и основных API endpoints по модулям.

---

## 1. Список таблиц БД

Все таблицы с данными тенанта содержат `restaurant_id` (кроме глобальных: `users` для super_admin, `audit_log` с опциональным `restaurant_id`). Хранение времени — в UTC; отображение — по timezone ресторана.

---

### 1.1. Тенанты и пользователи

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **restaurants** | Ресторан (тенант). | `id`, `name`, `timezone` (IANA, напр. Europe/Moscow), `contacts` (JSONB: phone, email, address), `created_at`, `updated_at` |
| **users** | Сотрудники платформы и ресторанов. | `id`, `email`, `password_hash`, `role` (super_admin \| owner \| admin \| manager), `restaurant_id` (NULL для super_admin), `is_active`, `created_at`, `updated_at`. Уникальность: `(restaurant_id, email)` с учётом NULL. |

---

### 1.2. Гости и столы

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **guests** | Единая база гостей по ресторану. Ключ слияния — телефон. | `id`, `restaurant_id`, `phone` (нормализованный), `name`, `birthday` (date), `preferences` (JSONB), `telegram_id` (nullable), `visit_count`, `first_visit_at`, `last_visit_at`, `created_at`, `updated_at`. UNIQUE `(restaurant_id, phone)`. |
| **tables** | Столы ресторана. | `id`, `restaurant_id`, `name` (или код, напр. "1", "Terrace-2"), `capacity` (опционально), `sort_order`, `created_at`, `updated_at`. |

---

### 1.3. Бронирования

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **bookings** | Журнал броней. Один стол не может быть занят дважды в один слот (блокировка через приложение/ограничения). | `id`, `restaurant_id`, `guest_id`, `table_id` (nullable до подтверждения), `booked_at` (timestamp UTC), `duration_minutes` (turn time), `buffer_minutes`, `guests_count`, `status` (new \| confirmed \| arrived \| completed \| cancelled \| no_show), `source` (bot \| manual \| walk_in), `confirmed_at`, `arrived_at`, `completed_at`, `created_by_user_id`, `created_at`, `updated_at`. Индексы: `(restaurant_id, booked_at)`, `(table_id, booked_at)` для проверки наложений. |

---

### 1.4. Telegram-боты (White Label)

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **telegram_bots** | Подключённые боты ресторанов. | `id`, `restaurant_id`, `encrypted_token` (AES-256), `bot_username`, `is_active`, `validated_at`, `created_at`, `updated_at`. |

---

### 1.5. Уведомления и шаблоны

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **notification_templates** | Шаблоны сервисных сообщений (подтверждение брони, напоминание за 60 мин, сбор отзывов). | `id`, `restaurant_id`, `type` (booking_confirmation \| reminder_60min \| feedback_request), `message_text`, `delay_minutes` (для feedback_request — после статуса «Пришел»), `buttons` (JSONB: массив кнопок), `is_active`, `created_at`, `updated_at`. |

---

### 1.6. Рассылки (Marketing)

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **campaigns** | Кампания рассылки (сегмент + сообщение). | `id`, `restaurant_id`, `name`, `segment_filter` (JSONB: min_visits, max_visits, last_visit_before_days, last_visit_after_days и т.п.), `message_text`, `attachment_url` (одно фото/файл), `status` (draft \| queued \| sending \| completed \| failed), `scheduled_at`, `started_at`, `completed_at`, `created_by_user_id`, `created_at`, `updated_at`. |
| **campaign_recipients** | Очередь/результат отправки по кампании. | `id`, `campaign_id`, `guest_id`, `status` (pending \| sent \| failed), `sent_at`, `telegram_message_id`, `error_message` (при failed), `created_at`. Индекс по `(campaign_id, status)` для воркеров. |

---

### 1.7. Обратная связь и чёрный список

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **feedback** | Отзывы/предложения гостей через бота (внутренний чат). | `id`, `restaurant_id`, `guest_id`, `message_text`, `source` (bot), `created_at`. |
| **blacklist** | Чёрный список гостей по ресторану. | `id`, `restaurant_id`, `guest_id` (или `phone` при отсутствии карточки), `reason` (nullable), `created_by_user_id`, `created_at`. |

---

### 1.8. Безопасность и аудит

| Таблица | Назначение | Ключевые поля |
|---------|------------|----------------|
| **audit_log** | Лог действий: кто, когда, сущность, старое/новое значение. | `id`, `restaurant_id` (nullable), `user_id`, `action` (create \| update \| delete \| login и т.д.), `entity_type` (booking, guest, user, …), `entity_id`, `old_value` (JSONB), `new_value` (JSONB), `ip`, `user_agent`, `created_at`. Индексы: `(restaurant_id, created_at)`, `(entity_type, entity_id)`. |

---

### 1.9. Опционально (расширение позже)

| Таблица | Назначение |
|---------|------------|
| **platform_news** | Новости от Super Admin для всех сотрудников (колокольчик в интерфейсе). |
| **support_tickets** | Тикеты поддержки/пожелания от ресторанов к Super Admin. |

---

## 2. API endpoints по модулям

Базовый префикс: `/api/v1`. Все ответы — JSON. Изоляция по `restaurant_id` — через middleware/dependency (текущий пользователь → restaurant_id). Super Admin может использовать `?restaurant_id=…` или Impersonation.

---

### 2.1. Auth

| Метод | Endpoint | Описание |
|------|----------|----------|
| POST | `/auth/login` | Вход (email, password) → access + refresh токены. |
| POST | `/auth/logout` | Инвалидация refresh-токена. |
| POST | `/auth/refresh` | Обновление access по refresh. |
| GET  | `/auth/me` | Текущий пользователь (роль, restaurant_id, права). |

---

### 2.2. Tenants (Super Admin)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/tenants` | Список ресторанов (пагинация, поиск). |
| GET    | `/tenants/:id` | Карточка ресторана. |
| POST   | `/tenants` | Создание ресторана. |
| PATCH  | `/tenants/:id` | Обновление (name, timezone, contacts). |

---

### 2.3. Restaurant (текущий тенант)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET   | `/restaurants/current` | Настройки текущего ресторана (для Owner/Admin/Manager). |
| PATCH | `/restaurants/current` | Обновление name, timezone, contacts. |

---

### 2.4. Users (сотрудники)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/users` | Список пользователей ресторана (фильтр по роли). |
| GET    | `/users/:id` | Карточка пользователя. |
| POST   | `/users` | Создание/приглашение (email, role, restaurant_id). |
| PATCH  | `/users/:id` | Обновление (роль, is_active). |
| DELETE | `/users/:id` | Деактивация/удаление (по политике). |

---

### 2.5. Guests (гости)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/guests` | Список гостей (поиск по phone, name, birthday; фильтр по сегменту; пагинация). |
| GET    | `/guests/:id` | Карточка гостя. |
| POST   | `/guests` | Ручное создание гостя (phone, name, birthday, preferences). |
| PATCH  | `/guests/:id` | Обновление профиля. |
| GET    | `/guests/:id/history` | История визитов/броней. |
| POST   | `/guests/:id/bot-link` | Ссылка для гостя «запустить бота» (для ручного внесённого гостя). |

---

### 2.6. Tables (столы)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/tables` | Список столов ресторана. |
| POST   | `/tables` | Создание стола (name, capacity, sort_order). |
| PATCH  | `/tables/:id` | Обновление. |
| DELETE | `/tables/:id` | Удаление (с проверкой активных броней). |

---

### 2.7. Bookings (брони)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/bookings` | Список броней (фильтры: date_from, date_to, status, table_id, guest_id). |
| GET    | `/bookings/calendar` | Сетка столов × слоты времени на дату (для журнала/Timeline). |
| GET    | `/bookings/:id` | Детали брони. |
| POST   | `/bookings` | Создание брони (manual/walk-in: guest_id, table_id, booked_at, duration_minutes, guests_count). |
| PATCH  | `/bookings/:id` | Изменение времени, стола, guests_count. |
| POST   | `/bookings/:id/confirm` | Подтверждение (с указанием table_id). |
| POST   | `/bookings/:id/arrived` | Чекин «Гость пришёл». |
| POST   | `/bookings/:id/complete` | Завершение визита (освобождение стола). |
| POST   | `/bookings/:id/cancel` | Отмена брони. |

Проверка наложений (один стол — один слот) выполняется при создании/обновлении брони на бэкенде.

---

### 2.8. Telegram Bots

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/bots` | Список ботов текущего ресторана (обычно один). |
| POST   | `/bots` | Подключение бота: передача токена, проверка через Telegram API, сохранение зашифрованного. |
| PATCH  | `/bots/:id` | Включение/выключение (is_active). |
| DELETE | `/bots/:id` | Отвязка бота (опционально с архивированием). |

---

### 2.9. Notification templates

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET   | `/notification-templates` | Список шаблонов (подтверждение, напоминание 60 мин, отзыв). |
| GET   | `/notification-templates/:id` | Один шаблон. |
| PATCH | `/notification-templates/:id` | Обновление message_text, delay_minutes, buttons, is_active. |

---

### 2.10. Campaigns (рассылки)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/campaigns` | Список кампаний (фильтр по status). |
| GET    | `/campaigns/:id` | Детали кампании + статистика (sent/failed/pending). |
| POST   | `/campaigns` | Создание (name, segment_filter, message_text, attachment_url) → status draft. |
| PATCH  | `/campaigns/:id` | Редактирование черновика. |
| POST   | `/campaigns/:id/send` | Постановка в очередь отправки (status → queued, воркеры обрабатывают с rate limit). |
| GET    | `/campaigns/segments/preview` | Предпросмотр: количество гостей по segment_filter (без отправки). |

---

### 2.11. Analytics

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET | `/analytics/guests` | Всего гостей; новых за период (date_from, date_to). |
| GET | `/analytics/bookings` | Статистика по броням за период: выполнено / no_show / отменено. |
| GET | `/analytics/retention` | (Опционально) Retention rate за период. |
| GET | `/analytics/nps` | (Опционально) Средний балл отзывов (NPS). |

---

### 2.12. Audit log

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET | `/audit-log` | Список записей (фильтры: user_id, entity_type, entity_id, date_from, date_to; пагинация). |

---

### 2.13. Feedback (отзывы гостей)

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET | `/feedback` | Список отзывов ресторана (пагинация, сортировка по дате). |
| GET | `/feedback/:id` | Один отзыв (для деталей). |

---

### 2.14. Blacklist

| Метод | Endpoint | Описание |
|------|----------|----------|
| GET    | `/blacklist` | Список записей чёрного списка. |
| POST   | `/blacklist` | Добавление (guest_id или phone, reason). |
| DELETE | `/blacklist/:id` | Удаление из чёрного списка. |

---

### 2.15. Bot API (вызовы от Telegram-бота)

Эти endpoints вызываются ботом (по внутреннему ключу или привязке bot token → restaurant_id). Не для Web Admin.

| Метод | Endpoint | Описание |
|------|----------|----------|
| POST | `/bot/guest-register` | Регистрация/обновление гостя по телефону и telegram_id (слияние с ручной карточкой по phone). |
| GET  | `/bot/guest-by-phone` | Поиск гостя по phone (для связки «уже есть в базе»). |
| POST | `/bot/booking-request` | Заявка на бронь от гостя (telegram_id, date, time, guests_count) → создание брони со status new. |
| GET  | `/bot/booking/:id` | Статус брони (для кнопок «Буду»/«Опоздаю» и т.д.). |
| POST | `/bot/feedback` | Сохранение отзыва/предложения от гостя (guest_id или telegram_id, message_text). |
| GET  | `/bot/notification-templates` | Шаблоны уведомлений ресторана (для отправки напоминаний и запроса отзыва). |

---

## 3. Сводка для старта разработки

- **БД:** Миграции Alembic с нуля: сначала `restaurants`, `users`, `guests`, `tables`, `bookings`, затем `telegram_bots`, `notification_templates`, `campaigns`, `campaign_recipients`, `feedback`, `blacklist`, `audit_log`.
- **API:** Реализовать в FastAPI по доменам: auth, tenants, restaurants, users, guests, tables, bookings, bots, notification-templates, campaigns, analytics, audit-log, feedback, blacklist, bot (отдельный роутер для вызовов бота).
- **Фронт:** Экраны под перечисленные endpoints: логин, настройки ресторана, пользователи, гости (поиск + карточка + история), столы, журнал броней (календарь/сетка), подтверждение/чекин/завершение, боты, шаблоны уведомлений, кампании рассылок, аналитика, аудит, отзывы, чёрный список.
- **Бот:** Команды /start, /profile, /book, /feedback; обработчики кнопок и состояний (FSM); все данные через Bot API выше.

После утверждения этой схемы можно переходить к реальной разработке: репозиторий, Docker Compose, первая миграция и первый endpoint.
