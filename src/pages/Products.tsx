import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { Product } from "../lib/types";
import { formatBRL, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { Package, PencilSimple, Trash } from "phosphor-react";

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
      <div id="tour-products" className="mb-3">
        <p className="text-[10px] text-neutral-400 dark:text-white/30">Gestão de catálogo</p>
        <h1 className="text-[22px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">Produtos</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-sm mb-4">
        <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Nome do produto"
              className={`w-full rounded-xl border bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none ${
                errors.name ? "border-red-500" : "border-neutral-200 dark:border-white/10"
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-500 font-heading font-extrabold">{errors.name}</p>}
          </div>
          <div>
            <input
              value={amountStr}
              onChange={(e) => {
                setAmountStr(maskBRLInput(e.target.value));
                if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
              }}
              placeholder="R$ 0,00"
              className={`w-full rounded-xl border bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none ${
                errors.amount ? "border-red-500" : "border-neutral-200 dark:border-white/10"
              }`}
            />
            {errors.amount && <p className="mt-1 text-[11px] text-red-500 font-heading font-extrabold">{errors.amount}</p>}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="sm:col-span-2 min-h-[82px] w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-sm outline-none resize-y"
          />
          <button
            type="submit"
            className="sm:col-span-2 rounded-xl bg-[#9EEA6C] py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a]"
          >
            {editingId ? "Salvar alterações" : "Cadastrar produto"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-white/5">
          <h2 className="text-[14px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">
            Catálogo ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Package size={26} className="mx-auto text-neutral-300 dark:text-white/20 mb-2" />
            <p className="text-[12px] text-neutral-500 dark:text-white/40">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {products.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-heading font-extrabold text-[#0a0a0a] dark:text-white truncate">{p.name}</p>
                  <p className="text-[12px] text-[#0a0a0a] dark:text-white/80">{formatBRL(p.amount_cents)}</p>
                  {p.description && (
                    <p className="text-[11px] text-neutral-500 dark:text-white/35 mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-white/10 flex items-center justify-center text-red-500"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
