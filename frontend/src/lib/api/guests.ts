import { apiFetchWithAuth } from "@/lib/api-client";
import type { Guest, GuestCreateInput, GuestUpdateInput } from "@/types/guest";

export type GuestsListResponse = { items: Guest[]; total: number } | Guest[];

export async function fetchGuests(
  token: string,
  params?: { search?: string; page?: number; limit?: number }
): Promise<{ items: Guest[]; total: number }> {
  const searchParams: Record<string, string> = {};
  if (params?.search) searchParams.search = params.search;
  if (params?.page != null) searchParams.page = String(params.page);
  if (params?.limit != null) searchParams.limit = String(params.limit);
  const res = await apiFetchWithAuth<GuestsListResponse>(
    "/guests",
    token,
    Object.keys(searchParams).length > 0 ? { params: searchParams } : undefined
  );
  if (Array.isArray(res)) {
    return { items: res, total: res.length };
  }
  return { items: res.items ?? [], total: res.total ?? 0 };
}

export async function fetchGuest(
  token: string,
  id: string
): Promise<Guest> {
  return apiFetchWithAuth<Guest>(`/guests/${id}`, token);
}

export async function createGuest(
  token: string,
  data: GuestCreateInput
): Promise<Guest> {
  return apiFetchWithAuth<Guest>("/guests", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGuest(
  token: string,
  id: string,
  data: GuestUpdateInput
): Promise<Guest> {
  return apiFetchWithAuth<Guest>(`/guests/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
