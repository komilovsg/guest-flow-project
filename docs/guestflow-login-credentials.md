# GuestFlow — учётные данные для входа

## После выполнения сидов

1. **Супер-админ** (без привязки к ресторану, для админки тенантов):
   - **Email:** `admin@guestflow.local`
   - **Пароль:** `admin`

2. **Владелец ресторана** (для дашборда: гости, столы, брони):
   - **Email:** `owner@guestflow.local`
   - **Пароль:** `owner`

Эндпоинты гостей, столов и броней требуют контекст ресторана. У super_admin нет `restaurant_id`, поэтому для проверки сценария **логин → дашборд → гости/столы/брони** используйте **owner@guestflow.local** / **owner**.

---

## Как подготовить бэкенд

```bash
cd backend

# 1. Миграции
alembic upgrade head

# 2. Супер-админ (опционально, для админки)
python scripts/seed_super_admin.py

# 3. Ресторан и владелец (для теста гостей/столов/броней)
python scripts/seed_restaurant_and_owner.py
```

Переменные окружения для сидов (по желанию):
- `SEED_EMAIL` / `SEED_PASSWORD` — для super_admin (по умолчанию admin@guestflow.local / admin)
- `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` — для owner (по умолчанию owner@guestflow.local / owner)
- `SEED_RESTAURANT_NAME` — название ресторана (по умолчанию «Тестовый ресторан»)
