import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getTrainingMaterials, getTrainingPlaylists } from "@/lib/training-content";
import { TRAINING_STATUS_OPTIONS } from "@/lib/training-templates";
import { saveTrainingPlaylist } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrainingPlaylistPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento/playlist");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const [playlists, materials] = await Promise.all([getTrainingPlaylists(event.id), getTrainingMaterials(event.id)]);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1" || playlists.length === 0;
  const editing = editId ? playlists.find((playlist) => playlist.id === editId) : playlists[0];

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Treinamento · YouTube</span>
            <h1 className="mt-4 text-3xl font-black text-green-950">Playlist de treinamento</h1>
            <p className="mt-3 max-w-3xl text-stone-700">Cadastre o link da playlist do YouTube e use esta tela para controlar quais vídeos já foram gravados, aprovados e publicados.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/treinamento/playlist?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Nova playlist</Link>
            <Link href="/admin/festa-junina/treinamento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Voltar</Link>
          </div>
        </div>

        {(showNew || editing) ? (
          <form action={saveTrainingPlaylist} className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <input type="hidden" name="id" value={showNew && !editId ? "" : editing?.id ?? ""} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-green-950">Título<input name="title" defaultValue={showNew && !editId ? "Playlist de treinamento — Festa Junina Tucxa" : editing?.title ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={editing?.status ?? "rascunho"} className="rounded-2xl border border-green-100 p-3 font-normal">{TRAINING_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 10} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Link da playlist<input name="playlist_url" defaultValue={editing?.playlist_url ?? ""} placeholder="https://youtube.com/playlist?..." className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={editing?.description ?? ""} className="min-h-24 rounded-2xl border border-green-100 p-3 font-normal" /></label>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar playlist</button>
          </form>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {playlists.map((playlist) => (
            <article key={playlist.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-green-950">{playlist.title}</h2>
              {playlist.description ? <p className="mt-2 text-sm text-stone-700">{playlist.description}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/admin/festa-junina/treinamento/playlist?edit=${playlist.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link>
                {playlist.playlist_url ? <a href={playlist.playlist_url} target="_blank" rel="noreferrer" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950">Abrir YouTube</a> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <h2 className="text-xl font-black">Ordem sugerida para a playlist</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            {materials.slice(0, 10).map((material) => <li key={material.id}>{material.title}</li>)}
          </ol>
        </div>
      </section>
    </AdminPageShell>
  );
}
