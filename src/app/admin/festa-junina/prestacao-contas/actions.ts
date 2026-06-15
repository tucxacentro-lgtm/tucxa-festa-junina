"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

const PRESTACAO_PATH = "/admin/festa-junina/prestacao-contas";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function money(formData: FormData, name: string) {
  const value = text(formData, name).replace(/\./g, "").replace(",", ".");
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numericValue(formData: FormData, name: string) {
  const value = text(formData, name).replace(",", ".");
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeEntryType(value: string) {
  return value === "manual_revenue" ? "manual_revenue" : "expense";
}

function normalizeStatus(value: string, amount: number | null) {
  if (value === "cancelled") return "cancelled";
  if (value === "pending_value" || amount === null) return "pending_value";
  return "confirmed";
}

function normalizeDate(formData: FormData) {
  const date = text(formData, "occurred_on");
  return date || null;
}

async function authorizeAccountingChange() {
  await requireAdmin(["admin", "coordenador", "caixa"], PRESTACAO_PATH);
  return getCurrentEventForAdmin();
}

export async function createAccountingEntry(formData: FormData) {
  const event = await authorizeAccountingChange();
  const supabase = createSupabaseAdminClient();
  const amount = money(formData, "amount");
  const entryType = normalizeEntryType(text(formData, "entry_type"));
  const status = normalizeStatus(text(formData, "status"), amount);

  const { error } = await supabase.from("event_accounting_entries").insert({
    event_id: event.id,
    entry_type: entryType,
    category: text(formData, "category") || (entryType === "expense" ? "Despesas" : "Receitas manuais"),
    description: text(formData, "description") || (entryType === "expense" ? "Despesa" : "Receita manual"),
    amount,
    quantity: numericValue(formData, "quantity"),
    unit_amount: money(formData, "unit_amount"),
    status,
    occurred_on: normalizeDate(formData),
    notes: nullableText(formData, "notes"),
  });

  if (error) {
    throw new Error(`Não foi possível criar o lançamento: ${error.message}`);
  }

  revalidatePath(PRESTACAO_PATH);
  revalidatePath(`${PRESTACAO_PATH}/gerar-pdf`);
}

export async function updateAccountingEntry(formData: FormData) {
  const event = await authorizeAccountingChange();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  if (!id) throw new Error("Lançamento não informado.");

  const amount = money(formData, "amount");
  const entryType = normalizeEntryType(text(formData, "entry_type"));
  const status = normalizeStatus(text(formData, "status"), amount);

  const { error } = await supabase
    .from("event_accounting_entries")
    .update({
      entry_type: entryType,
      category: text(formData, "category") || (entryType === "expense" ? "Despesas" : "Receitas manuais"),
      description: text(formData, "description") || (entryType === "expense" ? "Despesa" : "Receita manual"),
      amount,
      quantity: numericValue(formData, "quantity"),
      unit_amount: money(formData, "unit_amount"),
      status,
      occurred_on: normalizeDate(formData),
      notes: nullableText(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("event_id", event.id);

  if (error) {
    throw new Error(`Não foi possível atualizar o lançamento: ${error.message}`);
  }

  revalidatePath(PRESTACAO_PATH);
  revalidatePath(`${PRESTACAO_PATH}/gerar-pdf`);
}

export async function deleteAccountingEntry(formData: FormData) {
  const event = await authorizeAccountingChange();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  if (!id) throw new Error("Lançamento não informado.");

  const { error } = await supabase
    .from("event_accounting_entries")
    .delete()
    .eq("id", id)
    .eq("event_id", event.id);

  if (error) {
    throw new Error(`Não foi possível excluir o lançamento: ${error.message}`);
  }

  revalidatePath(PRESTACAO_PATH);
  revalidatePath(`${PRESTACAO_PATH}/gerar-pdf`);
}
