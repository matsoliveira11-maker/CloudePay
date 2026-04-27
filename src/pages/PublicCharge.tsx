import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import * as api from "../lib/api";
import type { Charge, Profile } from "../lib/mockBackend";
import { formatBRL } from "../lib/format";
import {
  QrCode,
  CopySimple,
  CheckCircle,
} from "phosphor-react";

type Stage = "loading" | "paying" | "success" | "notfound";

export default function PublicCharge() {
  const { slug, chargeId } = useParams<{ slug: string; chargeId: string }>();
  const nav = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [stage, setStage] = useState<Stage>("loading");

  useEffect(() => {
    async function load() {
      if (!slug || !chargeId) { setStage("notfound"); return; }
      const [p, c] = await Promise.all([
        api.getProfileBySlug(slug),
        api.getChargeBySlugAndId(slug, chargeId),
      ]);
      
      if (!p || !c) { setStage("notfound"); return; }
      
      setProfile(p);
      setCharge(c);
      
      if (c.status === "paid") {
        setStage("success");
      } else if (c.status === "expired") {
        setStage("notfound"); // Podemos criar um stage "expired" depois se quiser
      } else {
        setStage("paying");
      }
    }
    load();
  }, [slug, chargeId]);

  // Not found
  if (stage === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-5 text-center">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold text-neutral-900">Cobrança não encontrada</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          Esse link de pagamento não existe, já expirou ou já foi pago.
        </p>
        <Button onClick={() => nav("/")} className="mt-6">Ir para o início</Button>
      </div>
    );
  }

  // Loading
  if (stage === "loading" || !profile || !charge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  // Paying
  if (stage === "paying") {
    return (
      <PixStage
        charge={charge}
        profile={profile}
        onPaid={(c) => { setCharge(c); setStage("success"); }}
        onExpired={() => setStage("notfound")}
      />
    );
  }

  // Success
  return <SuccessStage charge={charge} profile={profile} />;
}

// ---------- PIX (pagando) ----------

function PixStage({
  charge: initial, profile, onPaid, onExpired,
}: {
  charge: Charge;
  profile: Profile;
  onPaid: (c: Charge) => void;
  onExpired: () => void;
}) {
  const [charge, setCharge] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<number | null>(null);

  // Tick para o contador
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Polling a cada 5s
  useEffect(() => {
    intervalRef.current = window.setInterval(async () => {
      const c = await api.getCharge(charge.id);
      if (!c) return;
      if (c.status === "paid") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onPaid(c);
      } else if (c.status === "expired") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpired();
      } else {
        setCharge(c);
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge.id]);

  const remaining = useMemo(() => {
    const ms = new Date(charge.expires_at).getTime() - now;
    return Math.max(0, Math.floor(ms / 1000));
  }, [charge.expires_at, now]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  async function copyPix() {
    await navigator.clipboard.writeText(charge.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function simulate() {
    await api.simulatePayment(charge.id);
    const c = await api.getCharge(charge.id);
    if (c?.status === "paid") onPaid(c);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-center px-5 py-4">
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 py-6 sm:py-8 space-y-5">
        {/* Info do profissional */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <QrCode size={28} weight="duotone" className="text-brand-600" />
          </div>
          <h1 className="mt-3 text-lg font-bold text-neutral-900">{profile.full_name}</h1>
          <p className="text-sm font-medium text-brand-700">{charge.service_name}</p>
          {charge.description && <p className="mt-1 text-sm text-neutral-500">{charge.description}</p>}
          {charge.payer_name && (
            <p className="mt-1 text-xs text-neutral-400">Para: {charge.payer_name}</p>
          )}
        </div>

        {/* Valor + status */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-neutral-900">{formatBRL(charge.amount_cents)}</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Aguardando pagamento • {mm}:{ss}
          </div>
        </div>

        {/* QR + copia-e-cola */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <ol className="mb-4 space-y-2 text-sm text-neutral-700">
            <li><span className="font-semibold">1.</span> Abra o app do seu banco</li>
            <li><span className="font-semibold">2.</span> Escaneie o QR ou cole o código</li>
            <li><span className="font-semibold">3.</span> Confirme o pagamento</li>
          </ol>

          <div className="flex justify-center">
            <img
              src={charge.qr_code_image}
              alt="QR Code PIX"
              className="h-64 w-64 rounded-xl border border-neutral-200"
            />
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Código PIX copia-e-cola
            </div>
            <div className="mt-2 break-all rounded-xl bg-neutral-50 p-3 font-mono text-[11px] text-neutral-700">
              {charge.pix_code}
            </div>
            <Button onClick={copyPix} size="lg" className="mt-3 w-full inline-flex items-center justify-center gap-2">
              <CopySimple size={18} weight="duotone" />
              {copied ? "Copiado!" : "Copiar código PIX"}
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-neutral-500">
            Verificando o pagamento automaticamente a cada 5 segundos…
          </div>
        </div>

        {/* Painel de teste */}
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Modo demonstração
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            O gateway real ainda não está conectado.
          </p>
          <Button onClick={simulate} variant="secondary" className="mt-3">
            Simular pagamento confirmado
          </Button>
        </div>
      </main>
    </div>
  );
}

// ---------- SUCCESS ----------

function SuccessStage({ charge, profile }: { charge: Charge; profile: Profile }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-center px-5 py-4">
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 py-6 sm:py-8 space-y-5">
        <div className="rounded-2xl border border-brand-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600">
            <CheckCircle size={36} weight="duotone" className="text-white" />
          </div>
        <h1 className="mt-4 text-2xl font-heading font-bold text-neutral-900">Pagamento confirmado!</h1>
        <p className="mt-1 text-sm text-neutral-600 font-body">
            Enviamos um comprovante para <span className="font-medium text-neutral-900">{charge.payer_email}</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <Row label="Comprovante nº" value={charge.receipt_number ?? "—"} mono />
          <Row label="Valor" value={formatBRL(charge.amount_cents)} />
          <Row label="Pago para" value={profile.full_name} />
          <Row label="Serviço" value={charge.service_name} />
          <Row
            label="Data"
            value={charge.paid_at ? new Date(charge.paid_at).toLocaleString("pt-BR") : "—"}
          />
          {charge.notes && <Row label="Obs" value={charge.notes} />}
        </div>

        <p className="text-center text-xs text-neutral-500">
          Você já pode fechar esta página com segurança.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-2.5 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className={`text-right text-sm font-semibold text-neutral-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
