import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getTrainingMaterial, trainingWhatsappShareText } from "@/lib/training-content";
import { TRAINING_AUDIENCE_LABELS, TRAINING_STATUS_LABELS } from "@/lib/training-templates";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ trainingId: string }> };

export default async function TrainingDetailPage({ params }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento");
  const { trainingId } = await params;
  const event = await getCurrentEventForAdmin();
  const material = await getTrainingMaterial(event.id, trainingId);
  if (!material) notFound();
  const whatsappText = trainingWhatsappShareText(material);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{TRAINING_AUDIENCE_LABELS[material.audience]}</span>
            <h1 className="mt-4 text-3xl font-black text-green-950">{material.title}</h1>
            <p className="mt-2 text-sm font-bold text-stone-600">Status: {TRAINING_STATUS_LABELS[material.status]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/festa-junina/treinamento/materiais?edit=${material.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link>
            <Link href="/admin/festa-junina/treinamento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Voltar</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          {material.objective ? <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-green-950">Objetivo</h2><p className="mt-3 text-stone-700">{material.objective}</p></section> : null}
          <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-green-950">Roteiro do vídeo/áudio</h2><p className="mt-3 whitespace-pre-wrap text-stone-700">{material.script_text || "Roteiro ainda não informado."}</p></section>
          <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-green-950">Texto para narração</h2><p className="mt-3 whitespace-pre-wrap text-stone-700">{material.voiceover_text || "Texto de narração ainda não informado."}</p></section>
          <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-green-950">Mensagem para WhatsApp</h2><p className="mt-3 whitespace-pre-wrap text-stone-700">{whatsappText}</p></section>
          <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-green-950">Descrição para YouTube</h2><p className="mt-3 whitespace-pre-wrap text-stone-700">{material.youtube_description || "Descrição ainda não informada."}</p>{material.youtube_tags ? <p className="mt-4 text-sm text-stone-600"><strong>Tags:</strong> {material.youtube_tags}</p> : null}{material.youtube_url ? <a href={material.youtube_url} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white">Abrir vídeo</a> : null}</section>
        </div>
      </section>
    </AdminPageShell>
  );
}
