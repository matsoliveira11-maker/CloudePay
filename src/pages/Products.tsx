import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { Product } from "../lib/types";
import { formatBRL, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { Package, PencilSimple, Trash, Plus, Tag, Coins, Info } from "phosphor-react";

export default function Products() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  async function reload() {
    if (!profile) return;
    const data = await api.listProductsByProfile(profile.id);
    setProducts(data);
  }

  useEffect(() => {
    reload();
  }, [profile?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const cleanName = sanitizeText(name, 60);
    const amountCents = parseBRLToCents(amountStr);
    const cleanDesc = sanitizeText(description, 180) || null;

    const newErrors: { name?: string; amount?: string } = {};
    if (cleanName.length < 2) newErrors.name = "Nome deve ter pelo menos 2 caracteres.";
    if (amountCents < 100) newErrors.amount = "Valor mínimo é R$ 1,00.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingId) {
      await api.updateProduct(editingId, {
        name: cleanName,
        amount_cents: amountCents,
        description: cleanDesc,
      });
      setEditingId(null);
    } else {
      await api.createProduct({
        profile_id: profile.id,
        name: cleanName,
        amount_cents: amountCents,
        description: cleanDesc,
      });
    }

    setName("");
    setAmountStr("");
    setDescription("");
    setErrors({});
    reload();
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    setAmountStr(maskBRLInput((p.amount_cents / 100).toFixed(2).replace(".", ",")));
    setDescription(p.description || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeProduct(id: string) {
    await api.deleteProduct(id);
    if (editingId === id) {
      setEditingId(null);
      setName("");
      setAmountStr("");
      setDescription("");
    }
    reload();
  }

  return (
    <Shell>
      <div className="max-w-4xl mx-auto">
        <div id="tour-products" className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 dark:text-white/30 font-body mb-1 uppercase tracking-widest">Catálogo de Serviços</p>
          <h1 className="text-[28px] sm:text-[36px] leading-tight font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tighter">
            Produtos
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* FORMULÁRIO */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <section className="rounded-[28px] sm:rounded-[32px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#9EEA6C]/10 flex items-center justify-center text-[#9EEA6C] border border-[#9EEA6C]/20 shadow-inner">
                  {editingId ? <PencilSimple size={20} weight="duotone" /> : <Plus size={20} weight="bold" />}
                </div>
                <h2 className="text-lg font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight">
                  {editingId ? "Editar Produto" : "Novo Produto"}
                </h2>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">Nome Comercial</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-white/10" />
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Ex: Consultoria VIP"
                      className={`w-full rounded-xl border bg-neutral-50 dark:bg-white/[0.02] pl-10 pr-4 py-3 text-[14px] outline-none transition-all focus:border-[#9EEA6C]/50 ${
                        errors.name ? "border-red-500" : "border-neutral-200 dark:border-white/10"
                      }`}
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-[10px] text-red-500 font-heading font-extrabold uppercase tracking-wide">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-[9px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">Valor de Venda</label>
                  <div className="relative">
                    <Coins size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-white/10" />
                    <input
                      value={amountStr}
                      onChange={(e) => {
                        setAmountStr(maskBRLInput(e.target.value));
                        if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                      }}
                      placeholder="R$ 0,00"
                      className={`w-full rounded-xl border bg-neutral-50 dark:bg-white/[0.02] pl-10 pr-4 py-3 text-[14px] outline-none transition-all focus:border-[#9EEA6C]/50 ${
                        errors.amount ? "border-red-500" : "border-neutral-200 dark:border-white/10"
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="mt-1.5 text-[10px] text-red-500 font-heading font-extrabold uppercase tracking-wide">{errors.amount}</p>}
                </div>

                <div>
                  <label className="text-[9px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">Descrição Breve</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="O que está incluso neste produto?"
                    className="min-h-[100px] w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] px-4 py-3 text-[14px] outline-none transition-all focus:border-[#9EEA6C]/50 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#9EEA6C] py-4 text-[11px] font-heading font-black text-[#0a0a0a] uppercase tracking-[0.2em] shadow-lg shadow-[#9EEA6C]/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {editingId ? <PencilSimple size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                    {editingId ? "Salvar Alterações" : "Cadastrar Produto"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setName("");
                        setAmountStr("");
                        setDescription("");
                        setErrors({});
                      }}
                      className="w-full mt-3 text-[10px] font-heading font-black text-neutral-400 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            </section>
          </aside>

          {/* LISTAGEM */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[13px] font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-[0.2em]">
                Catálogo <span className="text-[#9EEA6C] ml-1">({products.length})</span>
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.01] p-12 text-center">
                <Package size={40} weight="duotone" className="mx-auto text-neutral-300 dark:text-white/10 mb-4" />
                <p className="text-[13px] font-heading font-bold text-neutral-400 dark:text-white/20 uppercase tracking-widest">Nenhum produto cadastrado</p>
                <p className="text-[11px] text-neutral-400/60 dark:text-white/10 mt-2">Os produtos que você cadastrar aparecerão aqui.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    className="group bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-[#9EEA6C]/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center text-[#9EEA6C] border border-neutral-100 dark:border-white/10 shrink-0">
                        <Package size={24} weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[17px] font-heading font-black text-[#0a0a0a] dark:text-white truncate uppercase tracking-tight">{p.name}</h3>
                        {p.description ? (
                          <p className="text-[11px] sm:text-[12px] text-neutral-400 dark:text-white/30 font-medium line-clamp-1 mt-0.5">{p.description}</p>
                        ) : (
                          <p className="text-[11px] text-neutral-300 dark:text-white/10 font-medium mt-0.5 italic">Sem descrição</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 border-neutral-50 dark:border-white/5 pt-4 sm:pt-0">
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-heading font-black text-[#9EEA6C] uppercase tracking-widest mb-0.5">Venda</p>
                        <p className="text-[16px] sm:text-[18px] font-heading font-black text-[#0a0a0a] dark:text-white">{formatBRL(p.amount_cents)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/40 hover:text-[#9EEA6C] hover:border-[#9EEA6C]/30 transition-all"
                          title="Editar"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/[0.03] border border-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                          title="Excluir"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 sm:mt-12 p-6 bg-[#0a0a0a] dark:bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#9EEA6C]/10 flex items-center justify-center text-[#9EEA6C]">
            <Info size={20} weight="bold" />
          </div>
          <div>
            <p className="text-[13px] font-heading font-black text-white uppercase tracking-tight leading-none">Produtos do Catálogo</p>
            <p className="text-[11px] text-white/40 font-medium mt-1">Produtos cadastrados aqui aparecem como opções rápidas ao criar uma nova cobrança.</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
