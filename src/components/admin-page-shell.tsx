import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";

export function AdminPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-amber-50 text-stone-900 lg:pl-72">
      <SiteHeader />
      <AdminSidebar />
      {children}
    </main>
  );
}
