import { cookies } from "next/headers";
import Link from "next/link";
import { SessionCheckClientDiagnostics } from "./session-check-client";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white p-4">
      <span className="font-bold text-green-950">{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-black ${ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
        {ok ? "Sim" : "Não"}
      </span>
    </div>
  );
}

export default async function AdminSessionCheckPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const accessCookie = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshCookie = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  const signedPayload = verifyAdminSessionToken(adminCookie);
  const currentAdmin = await getCurrentAdmin();

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-10 text-stone-900">
      <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">Diagnóstico</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Sessão administrativa</h1>
        <p className="mt-2 text-sm text-stone-600">
          Esta tela ajuda a verificar se os cookies do admin foram gravados corretamente. Ela não mostra tokens nem segredos.
        </p>

        <div className="mt-6 grid gap-3">
          <StatusRow label="Cookie tucxa_admin_session encontrado" ok={Boolean(adminCookie)} />
          <StatusRow label="Cookie de access token encontrado" ok={Boolean(accessCookie)} />
          <StatusRow label="Cookie de refresh token encontrado" ok={Boolean(refreshCookie)} />
          <StatusRow label="Assinatura da sessão admin válida" ok={Boolean(signedPayload)} />
          <StatusRow label="Gestor atual identificado" ok={Boolean(currentAdmin)} />
        </div>

        <SessionCheckClientDiagnostics />

        {currentAdmin ? (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-950">
            <p><strong>E-mail:</strong> {currentAdmin.user.email ?? "não informado"}</p>
            <p><strong>Perfil:</strong> {currentAdmin.profile.role}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white" prefetch={false}>
            Ir para o admin
          </Link>
          <Link href="/admin/logout" className="rounded-2xl bg-white px-5 py-3 font-black text-green-950 shadow-sm ring-1 ring-amber-100" prefetch={false}>
            Sair e testar login novamente
          </Link>
        </div>
      </section>
    </main>
  );
}
