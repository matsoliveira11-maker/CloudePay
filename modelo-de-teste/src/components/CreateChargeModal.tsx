import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronRight, Package, User, DollarSign, FileText, Check } from "lucide-react";
import { formatBRL, PRODUCTS, type Charge } from "../data";

type NewCharge = Omit<Charge, "id" | "date" | "status">;

export default function CreateChargeModal({
  open, onClose, onCreate,
}: { open: boolean; onClose(): void; onCreate(c: NewCharge): void }) {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const product = PRODUCTS.find(p => p.id === productId)!;
  const isCustom = product.price === 0;
  const parsed = Number(amount.replace(",", ".")) || 0;
  const computedAmt = isCustom ? parsed : product.price;
  const canSubmit = customer.trim().length > 1 && computedAmt > 0;

  const reset = useCallback(() => {
    setProductId(PRODUCTS[0].id); setCustomer(""); setAmount(""); setNote(""); setDone(false);
  }, []);

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; setTimeout(() => inputRef.current?.focus(), 200); }
    else { document.body.style.overflow = ""; setTimeout(reset, 300); }
    return () => { document.body.style.overflow = ""; };
  }, [open, reset]);

  function submit() {
    if (!canSubmit) return;
    const service = isCustom ? (note.trim() || "Cobrança avulsa") : product.name;
    const initials = customer.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
    onCreate({ service, customer: customer.trim(), gross: computedAmt, avatar: initials || "?" });
    setDone(true);
    setTimeout(onClose, 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 anim-fade" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        onClick={done ? undefined : onClose} />

      {done ? (
        <div className="relative w-full lg:w-[380px] anim-scale rounded-t-[20px] lg:rounded-[20px] p-8 text-center bg-white"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}>
            <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-[16px] font-semibold text-[#1a1a2e]">Cobrança criada</h3>
          <p className="text-[13px] text-[#8c8c8c] mt-1">Link PIX gerado com sucesso</p>
          <p className="text-[24px] font-bold tracking-[-0.02em] text-[#1a1a2e] num mt-5">{formatBRL(computedAmt)}</p>
          <p className="text-[13px] text-[#5c5c6d] mt-1">{customer}</p>
        </div>
      ) : (
        <div className="relative w-full lg:w-[460px] anim-slide max-h-[90dvh] flex flex-col rounded-t-[20px] lg:rounded-[20px] bg-white"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>

          <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #fce4ec" }}>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1a1a2e]">Nova cobrança</h3>
              <p className="text-[12px] text-[#8c8c8c] mt-0.5">Gere um link PIX para o cliente</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fff1f2] text-[#8c8c8c] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Produto" icon={<Package className="w-4 h-4" />}>
              <select value={productId} onChange={e => setProductId(e.target.value)}
                className="w-full bg-transparent text-[14px] text-[#1a1a2e] focus:outline-none appearance-none cursor-pointer">
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id} style={{ background: "#fff", color: "#1a1a2e" }}>
                    {p.name}{p.price > 0 ? ` · ${formatBRL(p.price)}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Cliente" icon={<User className="w-4 h-4" />}>
              <input ref={inputRef} value={customer} onChange={e => setCustomer(e.target.value)}
                placeholder="Nome do cliente" className="w-full bg-transparent text-[14px] text-[#1a1a2e] placeholder:text-[#d4d4d8] focus:outline-none" />
            </Field>

            {isCustom && (
              <>
                <Field label="Valor" icon={<DollarSign className="w-4 h-4" />}>
                  <input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                    placeholder="0,00" className="w-full bg-transparent text-[14px] text-[#1a1a2e] placeholder:text-[#d4d4d8] focus:outline-none num" />
                </Field>
                <Field label="Descrição (opcional)" icon={<FileText className="w-4 h-4" />}>
                  <input value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Ex.: frete, ajuste..." className="w-full bg-transparent text-[14px] text-[#1a1a2e] placeholder:text-[#d4d4d8] focus:outline-none" />
                </Field>
              </>
            )}

            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "#fff1f2" }}>
              <span className="text-[12px] text-[#be123c] font-medium">Valor total</span>
              <span className="text-[20px] font-bold tracking-[-0.02em] text-[#e11d48] num">{formatBRL(computedAmt)}</span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-3 flex gap-2.5" style={{ borderTop: "1px solid #fce4ec" }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#5c5c6d] hover:text-[#1a1a2e] transition-colors"
              style={{ background: "#f8f7f5" }}>
              Cancelar
            </button>
            <button onClick={submit} disabled={!canSubmit}
              className="flex-[1.5] py-2.5 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:brightness-105"
              style={{ background: canSubmit ? "linear-gradient(135deg, #e11d48, #be123c)" : "#d4d4d8" }}>
              Gerar link <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c8c8c] mb-1.5">{label}</p>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#fecdd3]"
        style={{ background: "#f8f7f5", border: "1px solid #fce4ec" }}>
        <span className="text-[#d4d4d8] shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </label>
  );
}
