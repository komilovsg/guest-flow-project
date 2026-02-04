export interface Table {
  id: string;
  restaurant_id: string;
  name: string;
  capacity: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TableCreateInput {
  name: string;
  capacity?: number | null;
  sort_order?: number;
}

export interface TableUpdateInput {
  name?: string;
  capacity?: number | null;
  sort_order?: number;
}
