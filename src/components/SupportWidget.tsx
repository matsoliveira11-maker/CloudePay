import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getClientTickets, getTicketMessages, sendTicketMessage, createTicket } from "../lib/api";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";
import { 
  CaretLeft, 
  PaperPlaneTilt, 
  X, 
  Plus, 
  Headset,
  CheckCircle,
  Clock
} from "phosphor-react";

interface SupportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportWidget({ isOpen, onClose }: SupportWidgetProps) {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Novo chamado
  const [subject, setSubject] = useState("");
  const [initialMsg, setInitialMsg] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carregar tickets
  useEffect(() => {
    if (!profile || !isOpen) return;
    getClientTickets(profile.id).then(setTickets);

    const sub = supabase.channel("client_tickets_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets", filter: `user_id=eq.${profile.id}` }, () => {
        getClientTickets(profile.id).then(setTickets);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [profile, isOpen]);

  // Carregar mensagens do ticket selecionado
  useEffect(() => {
    if (!selectedTicket || !isOpen) return;

    getTicketMessages(selectedTicket.id).then((msgs) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    const sub = supabase.channel(`client_messages_v2_${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, () => {
        getTicketMessages(selectedTicket.id).then((msgs) => {
          setMessages(msgs);
          setTimeout(scrollToBottom, 100);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [selectedTicket, isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedTicket || !profile || isSending) return;
    setIsSending(true);
    try {
      await sendTicketMessage(selectedTicket.id, profile.id, newMessage.trim());
      setNewMessage("");
      const msgs = await getTicketMessages(selectedTicket.id);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error("Erro ao enviar mensagem", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!subject.trim() || !initialMsg.trim() || !profile) return;
    setIsSubmitting(true);
    try {
      const ticket = await createTicket(profile.id, subject.trim(), initialMsg.trim());
      setSubject("");
      setInitialMsg("");
      setIsCreating(false);
      const updatedTickets = await getClientTickets(profile.id);
      setTickets(updatedTickets);
      setSelectedTicket(ticket);
    } catch (e: any) {
      setCreateError(e.message || "Erro ao abrir chamado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-[#1a1a2e]/40 p-3 backdrop-blur-md sm:items-center sm:justify-center sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Widget Container */}
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#e8e8ec] bg-white shadow-2xl sm:h-[620px] a-up">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e8ec] bg-white px-6 py-5">
          <div className="flex items-center gap-4">
            {selectedTicket && (
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8ec] bg-white text-[#8c8c8c] transition hover:bg-[#f8f7f5] active:scale-95"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
            )}
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#e11d48] text-white shadow-lg shadow-rose-100">
              <Headset size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-[#1a1a2e]">
                {selectedTicket ? selectedTicket.subject : isCreating ? "Novo Chamado" : "Central de Ajuda"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <p className="text-[11px] font-bold text-[#8c8c8c] uppercase tracking-wider">
                  {selectedTicket
                    ? `Chamado #${selectedTicket.id.slice(-4).toUpperCase()}`
                    : "Suporte Online agora"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8ec] bg-white text-[#8c8c8c] transition hover:bg-[#fff1f2] hover:text-[#e11d48]"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#f8f7f5]/30">

          {/* --- NEW TICKET FORM --- */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              <p className="text-[13px] text-[#71717a]">Descreva sua dúvida ou problema detalhadamente para que possamos te ajudar.</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-[#8c8c8c]">Assunto</label>
                   <input
                     placeholder="Ex: Dúvida sobre taxas de saque"
                     value={subject}
                     onChange={(e) => setSubject(e.target.value)}
                     className="w-full rounded-xl border border-[#e8e8ec] bg-white px-4 py-3.5 text-[13px] font-medium text-[#1a1a2e] outline-none transition focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                     required
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-[#8c8c8c]">Mensagem</label>
                   <textarea
                     placeholder="Descreva aqui..."
                     value={initialMsg}
                     onChange={(e) => setInitialMsg(e.target.value)}
                     rows={6}
                     className="w-full resize-none rounded-xl border border-[#e8e8ec] bg-white px-4 py-3.5 text-[13px] font-medium text-[#1a1a2e] outline-none transition focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                     required
                   />
                </div>
              </div>
              {createError && (
                <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-[#e11d48]">{createError}</p>
              )}
              <div className="mt-auto flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-xl border border-[#e8e8ec] py-3.5 text-[13px] font-bold text-[#8c8c8c] transition hover:bg-[#f8f7f5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#e11d48] py-3.5 text-[13px] font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-[#be123c] disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Enviando..." : "Abrir Chamado"}
                </button>
              </div>
            </form>

          /* --- CHAT VIEW --- */
          ) : selectedTicket ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-10">
                    <p className="text-center text-[13px] text-[#8c8c8c]">Nenhuma mensagem ainda. Digite abaixo.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === profile.id;
                    return (
                      <div
                        key={m.id}
                        className={cn("flex max-w-[85%] flex-col", isMe ? "self-end items-end" : "self-start items-start")}
                      >
                        <div
                          className={cn(
                            "rounded-[18px] px-4 py-3 text-[13px] leading-relaxed shadow-sm",
                            isMe
                              ? "rounded-tr-sm bg-[#e11d48] text-white"
                              : "rounded-tl-sm border border-[#e8e8ec] bg-white text-[#1a1a2e]"
                          )}
                        >
                          {m.message}
                        </div>
                        <span className="mt-1.5 px-1 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-tighter">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-[#e8e8ec] bg-white p-4">
                {selectedTicket.status === "open" ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 rounded-xl border border-[#e8e8ec] bg-[#f8f7f5] px-4 py-3 text-[13px] font-medium text-[#1a1a2e] outline-none transition focus:bg-white focus:border-[#e11d48]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isSending || !newMessage.trim()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e11d48] text-white shadow-lg shadow-rose-100 transition hover:bg-[#be123c] disabled:opacity-40 active:scale-95"
                    >
                      <PaperPlaneTilt size={20} weight="bold" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 text-amber-600">
                     <Clock size={16} weight="bold" />
                     <p className="text-[12px] font-bold uppercase tracking-wider">Este chamado foi encerrado.</p>
                  </div>
                )}
              </div>
            </div>

          /* --- TICKETS LIST --- */
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#e8e8ec] px-6 py-4 bg-white">
                <p className="text-[13px] font-bold text-[#1a1a2e]">Chamados Recentes</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff1f2] px-3 py-1.5 text-[11px] font-bold text-[#e11d48] transition hover:bg-[#e11d48] hover:text-white"
                >
                  <Plus size={14} weight="bold" />
                  NOVO
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {tickets.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#f8f7f5] text-[#e11d48]">
                      <Headset size={32} weight="bold" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1a2e]">Nenhum chamado aberto</p>
                      <p className="mt-1 text-[13px] text-[#8c8c8c]">Estamos prontos para te ajudar com qualquer dúvida.</p>
                    </div>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="mt-2 rounded-xl bg-[#e11d48] px-6 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-[#be123c] active:scale-95"
                    >
                      Abrir primeiro chamado
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="w-full rounded-2xl border border-[#e8e8ec] bg-white p-4 text-left transition-all hover:border-[#e11d48] hover:shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-[#1a1a2e] text-[14px] leading-tight group-hover:text-[#e11d48] transition-colors">{t.subject}</p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              t.status === "open"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            )}
                          >
                            {t.status === "open" ? "Aberto" : "Encerrado"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                           <CheckCircle size={12} className={t.status === 'open' ? 'text-[#8c8c8c]' : 'text-emerald-500'} />
                           <p className="text-[11px] font-medium text-[#8c8c8c]">
                             Atualizado em {new Date(t.updated_at).toLocaleDateString("pt-BR")}
                           </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
