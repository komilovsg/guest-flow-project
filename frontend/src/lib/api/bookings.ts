import { apiFetchWithAuth } from "@/lib/api-client";
import type {
  Booking,
  BookingCreateInput,
  BookingUpdateInput,
} from "@/types/booking";

export interface BookingsParams {
  date_from?: string;
  date_to?: string;
  status?: string;
  table_id?: string;
  guest_id?: string;
}

export async function fetchBookings(
  token: string,
  params?: BookingsParams
): Promise<Booking[]> {
  const searchParams: Record<string, string> = {};
  if (params?.date_from) searchParams.date_from = params.date_from;
  if (params?.date_to) searchParams.date_to = params.date_to;
  if (params?.status) searchParams.status = params.status;
  if (params?.table_id) searchParams.table_id = params.table_id;
  if (params?.guest_id) searchParams.guest_id = params.guest_id;
  return apiFetchWithAuth<Booking[]>(
    "/bookings",
    token,
    Object.keys(searchParams).length ? { params: searchParams } : undefined
  );
}

export async function fetchBookingsCalendar(
  token: string,
  date: string
): Promise<{ slots: unknown[] }> {
  return apiFetchWithAuth<{ slots: unknown[] }>(
    "/bookings/calendar",
    token,
    { params: { date } }
  );
}

export async function fetchBooking(
  token: string,
  id: string
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}`, token);
}

export async function createBooking(
  token: string,
  data: BookingCreateInput
): Promise<Booking> {
  return apiFetchWithAuth<Booking>("/bookings", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBooking(
  token: string,
  id: string,
  data: BookingUpdateInput
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function confirmBooking(
  token: string,
  id: string,
  tableId?: string
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}/confirm`, token, {
    method: "POST",
    body: JSON.stringify(tableId != null ? { table_id: tableId } : {}),
  });
}

export async function arrivedBooking(
  token: string,
  id: string
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}/arrived`, token, {
    method: "POST",
  });
}

export async function completeBooking(
  token: string,
  id: string
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}/complete`, token, {
    method: "POST",
  });
}

export async function cancelBooking(
  token: string,
  id: string
): Promise<Booking> {
  return apiFetchWithAuth<Booking>(`/bookings/${id}/cancel`, token, {
    method: "POST",
  });
}
