export interface Guest {
  id: string;
  restaurant_id: string;
  phone: string;
  name: string | null;
  birthday: string | null;
  preferences: Record<string, unknown> | null;
  telegram_id: string | null;
  visit_count: number;
  first_visit_at: string | null;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestCreateInput {
  phone: string;
  name?: string | null;
  birthday?: string | null;
  preferences?: Record<string, unknown> | null;
}

export interface GuestUpdateInput {
  phone?: string;
  name?: string | null;
  birthday?: string | null;
  preferences?: Record<string, unknown> | null;
}
