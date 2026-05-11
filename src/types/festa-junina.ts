export type EventConfig = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  pix_key: string | null;
  pix_receiver_name: string | null;
  allow_public_sales: boolean;
  allow_combos: boolean;
  allow_children_free: boolean;
  children_free_age_limit: number;
  status: "draft" | "published" | "closed";
};

export type TicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  sale_mode: string;
  is_free: boolean;
  active?: boolean;
  sort_order?: number;
};

export type Combo = {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  badge: string | null;
  highlighted: boolean;
  includes_bingo?: boolean | null;
  bingo_cards_quantity?: number | null;
  active?: boolean;
  sort_order?: number;
};

export type PaymentOption = {
  id: string;
  name: string;
  method: string;
  instructions: string | null;
  active?: boolean;
  sort_order?: number;
};

export type TicketOrder = {
  id: string;
  event_id: string;
  buyer_code: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string;
  adults_quantity: number;
  children_quantity: number;
  selected_ticket_type_id: string | null;
  selected_combo_id: string | null;
  payment_option_id: string | null;
  total_amount: number | string;
  payment_status: "pending" | "proof_sent" | "paid" | "rejected" | "cancelled";
  payment_reviewed_at?: string | null;
  payment_reviewed_by?: string | null;
  payment_rejection_reason?: string | null;
  order_status: "created" | "confirmed" | "cancelled";
  notes: string | null;
  planning_answers: Record<string, unknown>;
  proof_file_path: string | null;
  proof_uploaded_at: string | null;
  includes_bingo: boolean;
  bingo_cards_quantity: number;
  referral_code: string | null;
  referred_by_code: string | null;
  created_at: string;
  updated_at: string;
};
