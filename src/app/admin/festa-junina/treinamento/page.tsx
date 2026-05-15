import Link from "next/link";
import { BookOpen, Clapperboard, MessageCircle, Music, PlayCircle } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getTrainingMaterials, getTrainingPlaylists } from "@/lib/training-content";
import { TRAINING_AUDIENCE_LABELS, TRAINING_STATUS_LABELS } from "@/lib/training-templates";
import { generateDefaultTrainingMaterials } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function StatusBadge({ status }: { status: string }) {
  const color = status === "publicado" ? "bg-green-100 text-green-900" : status === "aprovado" ? "bg-blue-100 text-blue-900" : status === "revisar" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${color}`}>{TRAINING_STATUS_LABELS[status as keyof typeof TRAINING_STATUS_LABELS] ?? status}</span>;
}

export default async function TreinamentoPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const [materials, playlists] = await Promise.all([getTrainingMaterials(event.id), getTrainingPlaylists(event.id)]);

  const byAudience = materials.reduce<Record<string, number>>((acc, item) => {
    acc[item.audience] = (acc[item.audience] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Treinamento</span>
              <h1 className="mt-4 text-3xl font-black text-green-950">Materiais de treinamento do sistema</h1>
              <p className="mt-3 max-w-4xl text-stone-700">
                Gere roteiros curtos para clientes e voluntários, grave vídeos ou áudios com ferramentas gratuitas e cadastre os links da playlist do YouTube para orientar a equipe antes e durante a Festa Junina.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={generateDefaultTrainingMaterials}>
                <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800">
                  Gerar roteiros padrão
                </button>
              </form>
              <Link href="/admin/festa-junina/treinamento/materiais?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Novo roteiro</Link>
              <Link href="/admin/festa-junina/treinamento/playlist" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Playlist</Link>
            </div>
          </div>

          {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Materiais de treinamento atualizados com sucesso.</div> : null}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-amber-50 p-5"><Clapperboard className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{materials.length}</p><p className="text-sm font-bold text-stone-700">roteiros cadastrados</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><PlayCircle className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{materials.filter((item) => item.youtube_url).length}</p><p className="text-sm font-bold text-stone-700">com link de vídeo</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><BookOpen className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{Object.keys(byAudience).length}</p><p className="text-sm font-bold text-stone-700">públicos/funções</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><Music className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{playlists.length}</p><p className="text-sm font-bold text-stone-700">playlist(s)</p></div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-green-950">Roteiros por público</h2>
                <p className="mt-1 text-sm text-stone-600">Use vídeos curtos de 30 a 90 segundos. Depois cadastre o link do YouTube no roteiro.</p>
              </div>
              <Link href="/admin/festa-junina/treinamento/materiais" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Ver todos</Link>
            </div>
            <div className="mt-6 grid gap-4">
              {materials.slice(0, 6).map((item) => (
                <article key={item.id} className="rounded-3xl border border-green-100 bg-stone-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{TRAINING_AUDIENCE_LABELS[item.audience]}</p>
                      <h3 className="mt-1 text-lg font-black text-green-950">{item.title}</h3>
                      {item.objective ? <p className="mt-2 text-sm text-stone-700">{item.objective}</p> : null}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={`/admin/festa-junina/treinamento/${item.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Abrir</Link>
                    {item.youtube_url ? <a href={item.youtube_url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm">YouTube</a> : null}
                  </div>
                </article>
              ))}
              {materials.length === 0 ? <p className="rounded-3xl border border-dashed border-green-200 bg-green-50 p-6 text-sm text-stone-700">Nenhum roteiro gerado ainda. Clique em <strong>Gerar roteiros padrão</strong> para criar a primeira lista.</p> : null}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
              <div className="flex items-center gap-3"><MessageCircle className="h-6 w-6" /><h2 className="text-xl font-black">Fluxo recomendado sem custo</h2></div>
              <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed">
                <li>Gere ou edite os roteiros no sistema.</li>
                <li>Grave a tela ou narração em ferramenta gratuita.</li>
                <li>Publique manualmente no YouTube como playlist.</li>
                <li>Cadastre os links no sistema.</li>
                <li>Envie a mensagem pronta pelo WhatsApp para cada função.</li>
              </ol>
            </div>
            <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-green-950">Playlist do evento</h2>
              <p className="mt-2 text-sm text-stone-700">Cadastre o link da playlist e organize os vídeos na ordem de uso: clientes, check-in, garçons, caixa, cozinha, entrega e coordenação.</p>
              <div className="mt-5 space-y-3">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="rounded-2xl bg-stone-50 p-4">
                    <p className="font-black text-green-950">{playlist.title}</p>
                    {playlist.playlist_url ? <a href={playlist.playlist_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-black text-green-800"><PlayCircle className="h-4 w-4" /> Abrir playlist</a> : <p className="mt-2 text-sm text-stone-600">Link ainda não cadastrado.</p>}
                  </div>
                ))}
              </div>
              <Link href="/admin/festa-junina/treinamento/playlist" className="mt-5 inline-block rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Configurar playlist</Link>
            </div>
          </aside>
        </div>
      </section>
    </AdminPageShell>
  );
}
