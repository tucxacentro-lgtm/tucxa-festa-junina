import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getAdminSidebarSections } from "@/lib/admin-menu";
import { getOpenEventForAdmin } from "@/lib/current-event";

async function getShellData() {
  try {
    const event = await getOpenEventForAdmin();
    if (!event) throw new Error("Nenhum evento aberto.");
    const sections = await getAdminSidebarSections(event.id);
    return { eventName: event.name, hasSelectedEvent: true, sections };
  } catch {
    const sections = await getAdminSidebarSections(null);
    return { eventName: null, hasSelectedEvent: false, sections };
  }
}

export async function AdminPageShell({ children }: { children: ReactNode }) {
  const shell = await getShellData();

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900 lg:pl-72">
      <SiteHeader />
      <AdminSidebar sections={shell.sections} eventName={shell.eventName} hasSelectedEvent={shell.hasSelectedEvent} />
      {children}
    </main>
  );
}
