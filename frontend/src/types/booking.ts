export type BookingStatus =
  | "new"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingSource = "bot" | "manual" | "walk_in";

export interface Booking {
  id: string;
  restaurant_id: string;
  guest_id: string;
  table_id: string | null;
  booked_at: string;
  duration_minutes: number;
  buffer_minutes: number;
  guests_count: number;
  status: BookingStatus;
  source: BookingSource;
  confirmed_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined from API when needed
  guest?: { id: string; name: string | null; phone: string };
  table?: { id: string; name: string };
}

export interface BookingCreateInput {
  guest_id: string;
  table_id?: string | null;
  booked_at: string; // ISO datetime
  duration_minutes?: number;
  buffer_minutes?: number;
  guests_count: number;
  source?: BookingSource;
}

export interface BookingUpdateInput {
  table_id?: string | null;
  booked_at?: string;
  duration_minutes?: number;
  buffer_minutes?: number;
  guests_count?: number;
}
