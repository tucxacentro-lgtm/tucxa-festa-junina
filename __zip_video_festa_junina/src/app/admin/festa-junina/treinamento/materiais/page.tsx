import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getTrainingMaterials } from "@/lib/training-content";
import { TRAINING_AUDIENCE_LABELS, TRAINING_AUDIENCE_OPTIONS, TRAINING_STATUS_LABELS, TRAINING_STATUS_OPTIONS } from "@/lib/training-templates";
import { saveTrainingMaterial } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function MaterialForm({ material }: { material?: Awaited<ReturnType<typeof getTrainingMaterials>>[number] }) {
  return (
    <form action={saveTrainingMaterial} className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={material?.id ?? ""} />
      <input type="hidden" name="training_key" value={material?.training_key ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{material ? "Editar roteiro" : "Novo roteiro"}</span>
          <h2 className="mt-3 text-2xl font-black text-green-950">{material?.title ?? "Criar material de treinamento"}</h2>
          <p className="mt-2 text-sm text-stone-600">Preencha o roteiro, narração, mensagem para WhatsApp e dados do vídeo. A chave é gerada automaticamente para novos roteiros.</p>
        </div>
        <Link href="/admin/festa-junina/treinamento/materiais" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Título<input name="title" required defaultValue={material?.title ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Público/função<select name="audience" defaultValue={material?.audience ?? "voluntarios"} className="rounded-2xl border border-green-100 p-3 font-normal">{TRAINING_AUDIENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Tipo<input name="training_type" defaultValue={material?.training_type ?? "video_curto"} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={material?.status ?? "rascunho"} className="rounded-2xl border border-green-100 p-3 font-normal">{TRAINING_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={material?.sort_order ?? 999} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Link do YouTube<input name="youtube_url" defaultValue={material?.youtube_url ?? ""} placeholder="https://youtube.com/..." className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Objetivo<textarea name="objective" defaultValue={material?.objective ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Roteiro do vídeo/áudio<textarea name="script_text" defaultValue={material?.script_text ?? ""} className="min-h-36 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Texto para narração<textarea name="voiceover_text" defaultValue={material?.voiceover_text ?? ""} className="min-h-32 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Mensagem pronta para WhatsApp<textarea name="whatsapp_message" defaultValue={material?.whatsapp_message ?? ""} className="min-h-28 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição para YouTube<textarea name="youtube_description" defaultValue={material?.youtube_description ?? ""} className="min-h-24 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Tags do YouTube<input name="youtube_tags" defaultValue={material?.youtube_tags ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar roteiro</button>
    </form>
  );
}

export default async function TrainingMaterialsPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento/materiais");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const materials = await getTrainingMaterials(event.id);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editing = editId ? materials.find((material) => material.id === editId) : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Treinamento</span>
            <h1 className="mt-4 text-3xl font-black text-green-950">Roteiros e materiais</h1>
            <p className="mt-3 max-w-3xl text-stone-700">Edite roteiros, textos de narração, mensagens de WhatsApp e links de vídeos curtos para clientes e voluntários.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/treinamento/materiais?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo roteiro</Link>
            <Link href="/admin/festa-junina/treinamento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Voltar</Link>
          </div>
        </div>

        {(showNew || editing) ? <div className="mt-8"><MaterialForm material={editing} /></div> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {materials.map((material) => (
            <article key={material.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{TRAINING_AUDIENCE_LABELS[material.audience]}</p>
                  <h2 className="mt-1 text-xl font-black text-green-950">{material.title}</h2>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">{TRAINING_STATUS_LABELS[material.status]}</span>
              </div>
              {material.objective ? <p className="mt-3 text-sm text-stone-700">{material.objective}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/admin/festa-junina/treinamento/${material.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Abrir</Link>
                <Link href={`/admin/festa-junina/treinamento/materiais?edit=${material.id}`} className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Editar</Link>
                {material.youtube_url ? <a href={material.youtube_url} target="_blank" rel="noreferrer" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950">YouTube</a> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminPageShell>
  );
}
