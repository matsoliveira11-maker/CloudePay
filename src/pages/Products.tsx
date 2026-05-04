import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { formatBRL, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import Shell from "../components/Shell";
import { Package, Plus, Trash, ArrowRight } from "phosphor-react";

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c8c8c]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#8c8c8c]">{hint}</p>}
    </div>
  );
}

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
      <div className="space-y-8 a-fade pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c8c8c]">Gestão de Catálogo</p>
            <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.03em] text-[#1a1a2e] leading-tight mt-0.5">Meus Produtos</h1>
            <p className="text-[14px] text-[#71717a] mt-1.5">Cadastre valores prontos para agilizar suas cobranças.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Create Form */}
          <section className="a-up-1">
             <div className="rounded-[18px] bg-white p-6 shadow-sm border border-[#e8e8ec]">
                <div className="flex items-center gap-2 mb-6 text-[#e11d48]">
                   <Plus size={20} weight="bold" />
                   <h2 className="text-[16px] font-bold text-[#1a1a2e]">Novo Produto</h2>
                </div>
                <form className="space-y-5" onSubmit={handleCreate}>
                  <Field label="Nome do produto" id="produto-nome">
                    <input 
                      className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 px-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" 
                      placeholder="Ex: Aula de Inglês" value={name} onChange={e => setName(e.target.value)} required />
                  </Field>
                  <Field label="Valor" id="produto-valor">
                    <input 
                      className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 px-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" 
                      placeholder="R$ 0,00" value={amountStr} onChange={e => setAmountStr(maskBRLInput(e.target.value))} required />
                  </Field>
                  <Field label="Descrição (opcional)" id="produto-desc">
                    <textarea 
                      className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 px-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none min-h-[100px] resize-none" 
                      placeholder="O que o cliente está pagando?" value={description} onChange={e => setDescription(e.target.value)} />
                  </Field>
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e11d48] px-6 py-4 text-[13px] font-bold text-white shadow-lg shadow-rose-100 hover:bg-[#be123c] transition-all active:scale-[0.97]">
                    {loading ? "Cadastrando..." : "Cadastrar Produto"} <ArrowRight size={16} weight="bold" />
                  </button>
                </form>
             </div>
          </section>

          {/* List Section */}
          <section className="a-up-2">
             <div className="rounded-[18px] bg-white p-6 shadow-sm border border-[#e8e8ec] h-full">
                <div className="flex items-center gap-2 mb-6 text-[#e11d48]">
                   <Package size={20} weight="bold" />
                   <h2 className="text-[16px] font-bold text-[#1a1a2e]">Produtos Ativos</h2>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {products.length === 0 ? (
                    <div className="sm:col-span-2 py-16 text-center">
                       <p className="text-[13px] text-[#8c8c8c]">Nenhum produto cadastrado ainda.</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <article key={product.id} className="group relative rounded-xl border border-[#e8e8ec] bg-[#f8f7f5]/50 p-5 transition-all hover:border-[#e11d48] hover:bg-white hover:shadow-md">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-[14px] font-bold text-[#1a1a2e]">{product.name}</h3>
                           <button onClick={() => handleDelete(product.id)} className="text-[#8c8c8c] hover:text-[#e11d48] transition-colors p-1">
                              <Trash size={16} />
                           </button>
                        </div>
                        <p className="text-[12px] text-[#71717a] line-clamp-2 mb-4 h-8">{product.description || "Sem descrição disponível"}</p>
                        <div className="flex items-center justify-between">
                           <span className="text-[18px] font-bold text-[#e11d48] num">{formatBRL(product.amount_cents)}</span>
                           <div className="w-6 h-6 rounded-lg bg-white border border-[#e8e8ec] flex items-center justify-center text-[#d4d4d8] group-hover:text-[#e11d48] transition-colors">
                              <ArrowRight size={12} weight="bold" />
                           </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
             </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
