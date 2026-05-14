import type React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import {
  MENU_STATUS_OPTIONS,
  getAdminMenuCatalog,
  getDefaultSectionOrder,
  getEventMenuConfigurations,
  type AdminMenuCatalogItem,
} from "@/lib/admin-menu";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { MENU_ROUTE_AUTO_VALUE, MENU_ROUTE_OPTIONS, getRouteLabel } from "@/lib/menu-routes";
import { MENU_TEMPLATES } from "@/lib/menu-templates";
import { deactivateMenuItem, saveMenuItemComplete } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
type MenuNode = AdminMenuCatalogItem & { children: MenuNode[] };
type EventConfigs = Awaited<ReturnType<typeof getEventMenuConfigurations>>;

const MENU_PATH = "/admin/festa-junina/menu";
const sections = getDefaultSectionOrder();

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function menuHref(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `${MENU_PATH}?${query.toString()}`;
}

function findMenuItem(catalog: AdminMenuCatalogItem[], itemKey: string | undefined) {
  if (!itemKey) return undefined;
  return catalog.find((item) => item.item_key === itemKey);
}

async function getData() {
  const [event, catalog] = await Promise.all([getCurrentEventForAdmin(), getAdminMenuCatalog()]);
  const eventConfigs = await getEventMenuConfigurations(event.id);
  return { event, catalog, eventConfigs };
}

function statusLabel(value: string) {
  return MENU_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function templateLabel(value: string | null | undefined) {
  if (!value) return "Sem modelo automático";
  return MENU_TEMPLATES.find((template) => template.key === value)?.label ?? value;
}

function buildMenuTree(items: AdminMenuCatalogItem[], section: string, eventConfigs: EventConfigs) {
  const getOrder = (item: AdminMenuCatalogItem) => eventConfigs.get(item.item_key)?.sort_order ?? item.sort_order;
  const sortedItems = items
    .filter((item) => item.section === section)
    .sort((a, b) => getOrder(a) - getOrder(b) || a.label.localeCompare(b.label));

  const nodes = new Map<string, MenuNode>();
  for (const item of sortedItems) nodes.set(item.item_key, { ...item, children: [] });

  const roots: MenuNode[] = [];
  for (const item of sortedItems) {
    const node = nodes.get(item.item_key);
    if (!node) continue;
    const parent = item.parent_key ? nodes.get(item.parent_key) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  function sortChildren(node: MenuNode) {
    node.children.sort((a, b) => getOrder(a) - getOrder(b) || a.label.localeCompare(b.label));
    node.children.forEach(sortChildren);
  }

  roots.forEach(sortChildren);
  return roots;
}

function parentOptions(catalog: AdminMenuCatalogItem[], currentKey?: string) {
  return catalog
    .filter((item) => item.item_key !== currentKey)
    .sort((a, b) => a.section.localeCompare(b.section) || a.sort_order - b.sort_order || a.label.localeCompare(b.label));
}

function depthPadding(depth: number) {
  if (depth <= 0) return "pl-4";
  if (depth === 1) return "pl-9";
  if (depth === 2) return "pl-14";
  return "pl-20";
}

function effectiveRoute(item: MenuNode) {
  if (item.route_path) return item.route_path;
  if (item.children.length) return null;
  return `/admin/festa-junina/modulo/${item.item_key}`;
}

function routeGroups() {
  const groups = new Map<string, typeof MENU_ROUTE_OPTIONS>();
  for (const option of MENU_ROUTE_OPTIONS) {
    const items = groups.get(option.group) ?? [];
    items.push(option);
    groups.set(option.group, items);
  }
  return Array.from(groups.entries());
}

function MenuItemForm({
  item,
  catalog,
  eventId,
  mode,
  parentKey,
  section,
  closeHref,
}: {
  item?: AdminMenuCatalogItem;
  catalog: AdminMenuCatalogItem[];
  eventId: string;
  mode: "edit" | "new";
  parentKey?: string | null;
  section?: string;
  closeHref: string;
}) {
  const selectedSection = item?.section ?? section ?? "Evento selecionado";
  const parents = parentOptions(catalog, item?.item_key);
  const selectedRoute = item?.route_path || MENU_ROUTE_AUTO_VALUE;
  const selectedTemplate = item?.template_key ?? "preparation";

  return (
    <form action={saveMenuItemComplete} className="grid gap-4">
      <input type="hidden" name="event_id" value={eventId} />
      {mode === "edit" ? <input type="hidden" name="item_key" value={item?.item_key ?? ""} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {mode === "edit" ? (
          <div className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">
            <p className="font-black text-green-950">Chave do item</p>
            <p className="mt-1 font-mono text-xs">{item?.item_key}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-950">
            <p className="font-black">Chave do item</p>
            <p className="mt-1 text-xs leading-relaxed">
              Será criada automaticamente a partir do nome. Ex.: “Sorteio da Air Fryer” vira <span className="font-mono">sorteio_da_air_fryer</span>.
            </p>
          </div>
        )}

        <label className="grid gap-1 text-sm font-bold text-green-950">
          Nome exibido no menu
          <input name="label" defaultValue={item?.label ?? ""} required className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: Sorteio da Air Fryer" />
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950">
          Seção
          <select name="section" defaultValue={selectedSection} className="rounded-2xl border border-stone-200 p-3 font-normal">
            {sections.map((sectionName) => <option key={sectionName} value={sectionName}>{sectionName}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950">
          Item pai / indentação
          <select name="parent_key" defaultValue={item?.parent_key ?? parentKey ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal">
            <option value="">Sem item pai</option>
            {parents.map((parent) => <option key={parent.item_key} value={parent.item_key}>{parent.section} · {parent.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950">
          Ordem padrão
          <input name="sort_order" type="number" defaultValue={item?.sort_order ?? 999} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
          Link / página vinculada
          <select name="route_path" defaultValue={selectedRoute} className="rounded-2xl border border-stone-200 p-3 font-normal">
            <option value={MENU_ROUTE_AUTO_VALUE}>Usar página automática pelo modelo abaixo</option>
            {routeGroups().map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((option) => (
                  <option key={option.path} value={option.path}>{option.label} — {option.path}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="text-xs font-normal text-stone-500">
            Escolha uma página já existente do sistema. Se nenhuma página específica existir, use a página automática pelo modelo.
          </span>
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
          Modelo da página automática
          <select name="template_key" defaultValue={selectedTemplate} className="rounded-2xl border border-stone-200 p-3 font-normal">
            {MENU_TEMPLATES.map((template) => <option key={template.key} value={template.key}>{template.label}</option>)}
          </select>
          <span className="text-xs font-normal text-stone-500">
            Usado somente quando o item não estiver vinculado a uma página específica. Serve para abrir uma tela padrão como “Relatório/BI”, “Cadastro simples” ou “Página em preparação”.
          </span>
        </label>

        <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
          Descrição
          <textarea name="description" defaultValue={item?.description ?? ""} className="min-h-24 rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Explique para que serve este item do menu." />
        </label>

        <label className="flex items-center gap-2 rounded-2xl bg-stone-50 p-3 text-sm font-bold text-green-950 md:col-span-2">
          <input name="opens_in_new_tab" type="checkbox" defaultChecked={item?.opens_in_new_tab ?? false} /> Abrir em nova aba
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
        <Link href={closeHref} className="rounded-2xl border border-stone-200 px-5 py-3 text-sm font-black text-green-950">Cancelar</Link>
        <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Salvar</button>
      </div>
    </form>
  );
}

function ModalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <Link href={MENU_PATH} className="absolute inset-0 cursor-pointer" aria-label="Fechar" />
      <div className="relative z-10 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="sticky top-0 z-20 mb-5 flex items-center justify-between gap-4 border-b border-stone-100 bg-white pb-4">
          <h3 className="text-2xl font-black text-green-950">{title}</h3>
          <Link href={MENU_PATH} className="rounded-full bg-stone-100 px-3 py-1 text-xl font-black text-stone-700" aria-label="Fechar">×</Link>
        </div>
        {children}
      </div>
    </div>
  );
}

function MenuRow({
  item,
  depth,
  catalog,
  eventId,
  eventConfigs,
}: {
  item: MenuNode;
  depth: number;
  catalog: AdminMenuCatalogItem[];
  eventId: string;
  eventConfigs: EventConfigs;
}) {
  const config = eventConfigs.get(item.item_key);
  const status = config?.status ?? (item.default_enabled ? "suggested" : "not_used");
  const customLabel = config?.custom_label?.trim();
  const route = effectiveRoute(item);
  return (
    <div className="rounded-2xl border border-stone-100 bg-white shadow-sm">
      <div className={`flex flex-wrap items-center gap-3 px-4 py-3 ${depthPadding(depth)}`}>
        <span className="select-none rounded-lg bg-stone-50 px-2 py-1 text-lg font-black text-stone-500" title="Referência visual: drag-and-drop será uma evolução futura.">☰</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-green-950">{customLabel || item.label}</h4>
            <span className="rounded-full bg-green-50 px-2 py-1 text-[0.65rem] font-black text-green-800">{statusLabel(status)}</span>
            {item.template_key ? <span className="rounded-full bg-amber-50 px-2 py-1 text-[0.65rem] font-black text-amber-900">{templateLabel(item.template_key)}</span> : null}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {item.parent_key ? `Dentro de ${item.parent_key}` : "Raiz da seção"} · Página: <span className="font-mono">{getRouteLabel(route)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {route ? <Link href={route} className="rounded-full border border-green-100 bg-white px-3 py-2 text-xs font-black text-green-950 hover:bg-green-50">Abrir</Link> : null}
          <Link href={menuHref({ edit: item.item_key })} className="rounded-full bg-green-900 px-3 py-2 text-xs font-black text-white">Editar</Link>
          <Link href={menuHref({ newChild: item.item_key })} className="rounded-full border border-green-100 bg-white px-3 py-2 text-xs font-black text-green-950 hover:bg-green-50">Novo filho</Link>
          <form action={deactivateMenuItem}>
            <input type="hidden" name="item_key" value={item.item_key} />
            <button className="rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700" title="Desativa o item sem apagar histórico.">Desativar</button>
          </form>
        </div>
      </div>

      {item.children.length ? (
        <div className="space-y-2 border-t border-stone-100 bg-stone-50/40 p-3">
          {item.children.map((child) => (
            <MenuRow key={child.item_key} item={child} depth={depth + 1} catalog={catalog} eventId={eventId} eventConfigs={eventConfigs} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default async function AdminMenuPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");
  const params = await searchParams;
  const { event, catalog, eventConfigs } = await getData();
  const editKey = firstParam(params?.edit);
  const newChildKey = firstParam(params?.newChild);
  const showNewRoot = firstParam(params?.new) === "1";
  const itemToEdit = findMenuItem(catalog, editKey);
  const parentForNewChild = findMenuItem(catalog, newChildKey);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Menu configurável</span>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-green-950">Cadastro do menu de gestão</h1>
              <p className="mt-3 max-w-4xl text-stone-700">
                Organize todos os itens do menu, sua hierarquia, sequência e página associada. A chave é criada automaticamente para novos itens. Use <strong>Editar</strong> ou <strong>Novo filho</strong> para alterar cada linha.
              </p>
            </div>
            <Link href={menuHref({ new: "1" })} className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800">
              <Plus className="h-4 w-4" /> Novo item
            </Link>
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Evento aberto: {event.name}</div>
          {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Menu salvo com sucesso.</div> : null}
          {params?.error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Não foi possível salvar. Verifique os campos obrigatórios.</div> : null}
        </div>

        <div className="mt-8 grid gap-6">
          <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-green-950">Estrutura visual</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                  Use <strong>Editar</strong> para mudar nome, página vinculada, modelo automático, pai/indentação e ordem. Use <strong>Novo filho</strong> para criar um item dentro da linha selecionada. O ícone ☰ indica o conceito de arrastar, que pode virar drag-and-drop numa próxima etapa.
                </p>
              </div>

            </div>
          </div>

          {sections.map((section) => {
            const roots = buildMenuTree(catalog, section, eventConfigs);
            if (!roots.length) return null;

            return (
              <div key={section} className="rounded-[2rem] border border-green-100 bg-stone-50 p-5 shadow-sm">
                <h3 className="text-xl font-black text-green-950">{section}</h3>
                <div className="mt-5 grid gap-3">
                  {roots.map((item) => (
                    <MenuRow key={item.item_key} item={item} depth={0} catalog={catalog} eventId={event.id} eventConfigs={eventConfigs} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {showNewRoot ? (
          <ModalShell title="Novo item do menu">
            <MenuItemForm catalog={catalog} eventId={event.id} mode="new" closeHref={MENU_PATH} />
          </ModalShell>
        ) : null}

        {itemToEdit ? (
          <ModalShell title={`Editar: ${itemToEdit.label}`}>
            <MenuItemForm item={itemToEdit} catalog={catalog} eventId={event.id} mode="edit" closeHref={MENU_PATH} />
          </ModalShell>
        ) : null}

        {parentForNewChild ? (
          <ModalShell title={`Novo item dentro de ${parentForNewChild.label}`}>
            <MenuItemForm catalog={catalog} eventId={event.id} mode="new" parentKey={parentForNewChild.item_key} section={parentForNewChild.section} closeHref={MENU_PATH} />
          </ModalShell>
        ) : null}

      </section>
    </AdminPageShell>
  );
}
