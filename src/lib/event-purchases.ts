import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export type FinalItemStatus = "planned" | "to_buy" | "bought" | "preparing" | "ready" | "unavailable";
export type IngredientStatus = "planned" | "to_buy" | "bought" | "stored" | "checked";

export type EventPurchaseFinalItem = {
  id: string;
  event_id: string;
  sales_menu_item_id: string | null;
  name: string;
  category: string | null;
  item_type: string;
  planned_quantity: number | string;
  purchased_quantity: number | string;
  consumed_quantity: number | string;
  unit_label: string;
  sales_price: number | string;
  estimated_cost: number | string;
  actual_cost: number | string;
  storage_location: string | null;
  status: FinalItemStatus;
  notes: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type EventPurchaseIngredient = {
  id: string;
  event_id: string;
  final_item_id: string | null;
  sales_menu_item_id: string | null;
  name: string;
  category: string | null;
  planned_quantity: number | string;
  purchased_quantity: number | string;
  unit_label: string;
  estimated_unit_cost: number | string;
  actual_unit_cost: number | string;
  supplier_hint: string | null;
  storage_location: string | null;
  status: IngredientStatus;
  notes: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  final_item?: Pick<EventPurchaseFinalItem, "id" | "name" | "category"> | null;
};

export const FINAL_ITEM_STATUS_LABELS: Record<FinalItemStatus, string> = {
  planned: "Planejado",
  to_buy: "Comprar",
  bought: "Comprado",
  preparing: "Em preparo",
  ready: "Pronto",
  unavailable: "Indisponível",
};

export const INGREDIENT_STATUS_LABELS: Record<IngredientStatus, string> = {
  planned: "Previsto",
  to_buy: "Comprar",
  bought: "Comprado",
  stored: "Armazenado",
  checked: "Conferido",
};

export function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getFinalPurchaseItems(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_purchase_final_items")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [] as EventPurchaseFinalItem[];
  return (data ?? []) as EventPurchaseFinalItem[];
}

export async function getPurchaseIngredients(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_purchase_ingredients")
    .select("*, final_item:event_purchase_final_items(id,name,category)")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [] as EventPurchaseIngredient[];
  return (data ?? []) as EventPurchaseIngredient[];
}
