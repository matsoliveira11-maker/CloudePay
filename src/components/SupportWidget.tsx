import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getClientTickets, getTicketMessages, sendTicketMessage, createTicket, closeTicket } from "../lib/api";
import { supabase } from "../lib/supabase";

interface SupportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
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

    const sub = supabase.channel("client_tickets_channel")
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

    const sub = supabase.channel(`client_messages_${selectedTicket.id}`)
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
    <div className="fixed inset-0 z-[80] flex items-end bg-[#4c0519]/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Widget */}
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] border border-[#fecdd3] bg-white shadow-[0_32px_100px_-20px_rgba(76,5,25,0.25)] sm:h-[620px]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#fecdd3] bg-gradient-to-br from-[#fffafa] to-[#fff1f2] px-6 py-5">
          <div className="flex items-center gap-4">
            {selectedTicket && (
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fecdd3] bg-white text-[#881337] shadow-sm transition hover:bg-[#fff1f2] hover:scale-105 active:scale-95"
              >
                <ChevronLeft />
              </button>
            )}
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-[#e11d48] text-white shadow-[0_8px_16px_rgba(225,29,72,0.25)]">
              <HeadsetIcon />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#4c0519]">
                {selectedTicket ? selectedTicket.subject : isCreating ? "Novo Chamado" : "Suporte VIP"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />
                <p className="text-[11px] font-medium text-[#881337]">
                  {selectedTicket
                    ? `Chamado #${selectedTicket.id.slice(-4).toUpperCase()} · ${selectedTicket.status === "open" ? "Aberto" : "Encerrado"}`
                    : "Time online · Resposta em minutos"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fecdd3] bg-white text-[#881337] shadow-sm transition hover:bg-[#fff1f2] hover:text-[#e11d48] hover:rotate-90"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* --- CRIAR NOVO CHAMADO --- */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
              <p className="text-sm text-[#881337]">Descreva seu problema e entraremos em contato.</p>
              <div className="space-y-3">
                <input
                  placeholder="Assunto (ex: Problema com saque)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-[#fecdd3] bg-[#fffafa] px-4 py-3 text-sm text-[#4c0519] outline-none placeholder:text-[#9f1239]/40 transition focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                  required
                />
                <textarea
                  placeholder="Descreva o problema com detalhes..."
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-[#fecdd3] bg-[#fffafa] px-4 py-3 text-sm text-[#4c0519] outline-none placeholder:text-[#9f1239]/40 transition focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                  required
                />
              </div>
              {createError && (
                <p className="rounded-xl bg-[#fff1f2] px-4 py-2 text-xs font-medium text-[#e11d48]">{createError}</p>
              )}
              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-2xl border border-[#fecdd3] py-3 text-sm font-semibold text-[#881337] transition hover:bg-[#fff1f2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-[#e11d48] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(225,29,72,0.25)] transition hover:bg-[#be123c] disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Abrir Chamado"}
                </button>
              </div>
            </form>

          /* --- CHAT DO TICKET SELECIONADO --- */
          ) : selectedTicket ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-center text-sm text-[#9f1239]/60">Nenhuma mensagem ainda. Digite abaixo.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === profile.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex max-w-[80%] flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "rounded-tr-sm bg-[#e11d48] text-white shadow-[0_4px_12px_rgba(225,29,72,0.2)]"
                              : "rounded-tl-sm border border-[#fecdd3] bg-[#fffafa] text-[#4c0519]"
                          }`}
                        >
                          {m.message}
                        </div>
                        <span className="mt-1 px-1 text-[10px] text-[#9f1239]/50">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {!isMe && m.profiles?.full_name && ` · ${m.profiles.full_name}`}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#fecdd3] bg-[#fffafa] p-3">
                {selectedTicket.status === "open" ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 rounded-2xl border border-[#fecdd3] bg-white px-4 py-2.5 text-sm text-[#4c0519] outline-none placeholder:text-[#9f1239]/40 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isSending || !newMessage.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e11d48] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)] transition hover:-translate-y-0.5 disabled:opacity-40"
                    >
                      <SendIcon />
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-[#9f1239]/60">Este chamado foi encerrado.</p>
                )}
              </div>
            </div>

          /* --- LISTA DE CHAMADOS --- */
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#fecdd3] px-5 py-3">
                <p className="text-sm font-semibold text-[#4c0519]">Meus Chamados</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e11d48] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(225,29,72,0.2)] transition hover:-translate-y-0.5"
                >
                  <PlusIcon />
                  Novo
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {tickets.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#e11d48]">
                      <HeadsetIcon />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4c0519]">Nenhum chamado aberto</p>
                      <p className="mt-1 text-sm text-[#881337]">Clique em "Novo" para entrar em contato com o suporte.</p>
                    </div>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="mt-2 rounded-2xl bg-[#e11d48] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(225,29,72,0.25)] transition hover:-translate-y-0.5"
                    >
                      Abrir primeiro chamado
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="w-full rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4 text-left transition hover:border-[#fda4af] hover:bg-[#fff1f2]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#4c0519] leading-tight">{t.subject}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              t.status === "open"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-[#dcfce7] text-[#166534]"
                            }`}
                          >
                            {t.status === "open" ? "Aberto" : "Encerrado"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#881337]">
                          Atualizado em {new Date(t.updated_at).toLocaleDateString("pt-BR")}
                        </p>
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
