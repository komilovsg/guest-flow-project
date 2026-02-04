import { apiFetchWithAuth } from "@/lib/api-client";
import type { Table, TableCreateInput, TableUpdateInput } from "@/types/table";

export async function fetchTables(token: string): Promise<Table[]> {
  return apiFetchWithAuth<Table[]>("/tables", token);
}

export async function createTable(
  token: string,
  data: TableCreateInput
): Promise<Table> {
  return apiFetchWithAuth<Table>("/tables", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTable(
  token: string,
  id: string,
  data: TableUpdateInput
): Promise<Table> {
  return apiFetchWithAuth<Table>(`/tables/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTable(token: string, id: string): Promise<void> {
  await apiFetchWithAuth(`/tables/${id}`, token, { method: "DELETE" });
}
