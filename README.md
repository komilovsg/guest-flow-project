# GuestFlow MVP

SaaS-платформа для управления гостями и бронированиями ресторанов с White Label Telegram-ботами.

## Стек

- **Backend:** FastAPI (Python 3.12), PostgreSQL, Redis, Alembic
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Инфраструктура:** Docker Compose

Подробнее: [docs/guestflow-stack-recommendation.md](docs/guestflow-stack-recommendation.md)

## Быстрый старт

### 1. Backend (Docker)

**Важно:** PostgreSQL в Docker слушает порт **5434** на хосте (чтобы не конфликтовать с локальным postgres на 5432). В `backend/.env` укажи `DATABASE_URL=...@localhost:5434/guestflow`.

```bash
# Запуск PostgreSQL, Redis и API
docker compose up -d postgres redis
```

Подождите, пока postgres и redis станут healthy, затем:

```bash
# Копировать .env и при необходимости поправить
cp backend/.env.example backend/.env

# Виртуальное окружение и зависимости (локально)
cd backend && python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Миграции
alembic upgrade head

# Создать первого пользователя (super_admin) — в Python shell или скрипт:
# from app.core.security import get_password_hash
# from app.models.user import User, UserRole
# user = User(email="admin@guestflow.local", password_hash=get_password_hash("admin"), role=UserRole.super_admin, restaurant_id=None)
# db.add(user); db.commit()

# Запуск API
uvicorn app.main:app --reload --port 8000
```

Или запустить backend в Docker:

```bash
docker compose up -d
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Откройте http://localhost:3000

### 3. Первый пользователь (seed)

После `alembic upgrade head` создайте супер-админа вручную или добавьте скрипт `backend/scripts/seed_super_admin.py` (опционально).

## Структура проекта

```
Umed-PM/
├── backend/          # FastAPI, Alembic, модели, API v1
├── frontend/         # Next.js 15, App Router
├── docs/             # ТЗ, стек, схема БД и API
├── docker-compose.yml
└── README.md
```

## Документация

- [Техническое задание](Техническое%20Задание_%20SaaS-платформа%20«GuestFlow»%20(MVP).md)
- [Стек и рекомендации](docs/guestflow-stack-recommendation.md)
- [Схема БД и API](docs/guestflow-database-and-api.md)
