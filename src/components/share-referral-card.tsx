import { CopyButton } from "@/components/copy-button";

type ShareReferralCardProps = {
  buyerCode: string;
  referralUrl: string;
  referredPaidCount?: number;
  earnedRewards?: string[];
};

export function ShareReferralCard({ buyerCode, referralUrl, referredPaidCount = 0, earnedRewards = [] }: ShareReferralCardProps) {
  return (
    <div className="rounded-3xl bg-green-950 p-5 text-white">
      <p className="text-sm font-black text-amber-200">Código para compartilhar</p>
      <p className="mt-2 break-words text-2xl font-black">{buyerCode}</p>
      <p className="mt-3 text-sm text-white/85">
        Compartilhe seu link com amigos. Se eles comprarem usando seu código, você poderá ganhar brindes configurados pela organização.
      </p>
      <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm break-words">{referralUrl}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton value={referralUrl} label="Copiar link de indicação" className="bg-white text-green-950 hover:bg-amber-50" />
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Garanta seu convite para o Arraiá do Tucxa: ${referralUrl}`)}`}
          className="rounded-2xl bg-amber-300 px-4 py-2 text-sm font-black text-green-950 transition hover:bg-amber-200"
          target="_blank"
          rel="noreferrer"
        >
          Compartilhar no WhatsApp
        </a>
      </div>
      <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
        <p><strong>Compras pagas com seu código:</strong> {referredPaidCount}</p>
        <div className="mt-2">
          <strong>Brindes conquistados:</strong>
          {earnedRewards.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {earnedRewards.map((reward) => <li key={reward}>{reward}</li>)}
            </ul>
          ) : (
            <p className="mt-1 text-white/80">Nenhum brinde confirmado ainda. Assim que indicações pagas forem validadas, os brindes aparecem aqui.</p>
          )}
        </div>
      </div>
    </div>
  );
}
