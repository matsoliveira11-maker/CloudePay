import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { formatBRL, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import Shell from "../components/Shell";
import { ArrowIcon } from "../components/Icons";

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[#9f1239]/80">{hint}</p>}
    </div>
  );
}

// --- Page Component ---

export default function Products() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);


  const reload = useCallback(async () => {
    if (!profile) return;
    const data = await api.listProductsByProfile(profile.id);
    setProducts(data);
  }, [profile]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const cleanName = sanitizeText(name, 60);
    const amountCents = parseBRLToCents(amountStr);
    const cleanDesc = sanitizeText(description, 180) || null;

    if (cleanName.length < 2 || amountCents < 100) return;

    setLoading(true);
    try {
      await api.createProduct({
        profile_id: profile.id,
        name: cleanName,
        amount_cents: amountCents,
        description: cleanDesc,
      });
      setName("");
      setAmountStr("");
      setDescription("");
      reload();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este produto?")) return;
    await api.deleteProduct(id);
    reload();
  }

  return (
    <Shell>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e11d48]">Produtos</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.065em] text-[#4c0519] sm:text-5xl">Cadastre valores prontos.</h1>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-[#881337]">Use produtos pré-definidos quando for gerar uma cobrança. Menos digitação, mais velocidade.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Novo produto</h2>
            <form className="mt-5 space-y-4" onSubmit={handleCreate}>
              <Field label="Nome" id="produto-nome">
                <input className="auth-input" placeholder="Ex: Aula particular" value={name} onChange={e => setName(e.target.value)} required />
              </Field>
              <Field label="Valor" id="produto-valor">
                <input className="auth-input" placeholder="R$ 80,00" value={amountStr} onChange={e => setAmountStr(maskBRLInput(e.target.value))} required />
              </Field>
              <Field label="Descrição" id="produto-desc">
                <textarea className="auth-input min-h-28 resize-none" placeholder="Detalhe o que o cliente está pagando." value={description} onChange={e => setDescription(e.target.value)} />
              </Field>
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.28)]">
                {loading ? "Cadastrando..." : "Cadastrar produto"} <ArrowIcon />
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Produtos cadastrados</h2>
            <div className="mt-5 grid gap-3">
              {products.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#881337]/50">Nenhum produto cadastrado ainda.</p>
              ) : (
                products.map((product) => (
                  <article key={product.id} className="group relative rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4 transition hover:border-[#e11d48]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-[#4c0519]">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#881337]">{product.description || "Sem descrição"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-semibold tracking-[-0.04em] text-[#e11d48]">{formatBRL(product.amount_cents)}</span>
                        <button onClick={() => handleDelete(product.id)} className="opacity-0 transition group-hover:opacity-100 text-red-500 hover:text-red-700">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
