import { useState, useEffect, useRef } from "react";
import { Headset, X, ArrowUp, Plus, ChatCircleDots } from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { getClientTickets, getTicketMessages, sendTicketMessage, createTicket } from "../lib/api";
import { supabase } from "../lib/supabase";

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
    
    // Create new form
    const [subject, setSubject] = useState("");
    const [initialMsg, setInitialMsg] = useState("");
    const [createError, setCreateError] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!profile || !isOpen) return;
        
        getClientTickets(profile.id).then(setTickets);

        const sub = supabase.channel('client_tickets_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `user_id=eq.${profile.id}` }, () => {
                getClientTickets(profile.id).then(setTickets);
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [profile, isOpen]);

    useEffect(() => {
        if (!selectedTicket || !isOpen) return;

        getTicketMessages(selectedTicket.id).then((msgs) => {
            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        });

        const sub = supabase.channel(`client_messages_${selectedTicket.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicket.id}` }, () => {
                getTicketMessages(selectedTicket.id).then((msgs) => {
                    setMessages(msgs);
                    setTimeout(scrollToBottom, 100);
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [selectedTicket, isOpen]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedTicket || !profile) return;
        try {
            await sendTicketMessage(selectedTicket.id, profile.id, newMessage);
            setNewMessage("");
            getTicketMessages(selectedTicket.id).then((msgs) => {
                setMessages(msgs);
                setTimeout(scrollToBottom, 100);
            });
        } catch (e) {
            console.error("Erro ao enviar mensagem", e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        if (!subject.trim() || !initialMsg.trim() || !profile) return;
        try {
            const ticket = await createTicket(profile.id, subject, initialMsg);
            setSubject("");
            setInitialMsg("");
            setIsCreating(false);
            // Refresh tickets and open the new one
            const updatedTickets = await getClientTickets(profile.id);
            setTickets(updatedTickets);
            setSelectedTicket(ticket);
        } catch (e: any) {
            console.error("Erro ao criar chamado", e);
            setCreateError(`Falha do Servidor: ${e.message || e.details || e.hint || "Erro desconhecido. Verifique o console ou o script SQL."}`);
        }
    };

    if (!profile || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex h-[500px] max-h-[90vh] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121212]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9EEA6C]/20 text-[#0a0a0a] dark:text-[#9EEA6C]">
                            <Headset size={18} weight="duotone" />
                        </div>
                        <div>
                            <h3 className="font-heading text-[14px] font-extrabold text-[#0a0a0a] dark:text-white leading-tight">Suporte CloudePay</h3>
                            <p className="font-body text-[10px] text-neutral-500 dark:text-white/40">Respondemos o mais rápido possível</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:text-white/40 dark:hover:bg-white/10">
                        <X size={16} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-transparent">
                    {isCreating ? (
                        <form onSubmit={handleCreate} className="flex h-full flex-col p-4 overflow-y-auto custom-scrollbar">
                            <h4 className="mb-4 font-heading text-[15px] font-extrabold text-[#0a0a0a] dark:text-white">Novo Chamado</h4>
                            <div className="space-y-3">
                                <input
                                    placeholder="Assunto (ex: Dúvida sobre saque)"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-body text-[13px] text-[#0a0a0a] focus:border-[#9EEA6C] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    required
                                />
                                <textarea
                                    placeholder="Descreva seu problema ou dúvida..."
                                    value={initialMsg}
                                    onChange={e => setInitialMsg(e.target.value)}
                                    className="h-32 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-body text-[13px] text-[#0a0a0a] focus:border-[#9EEA6C] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    required
                                />
                            </div>
                            {createError && (
                                <p className="mt-3 text-[11px] text-red-500 font-heading font-bold">{createError}</p>
                            )}
                            <div className="mt-auto flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 rounded-xl bg-neutral-100 py-2.5 font-heading text-[12px] font-bold text-neutral-600 dark:bg-white/5 dark:text-white/60">Cancelar</button>
                                <button type="submit" className="flex-1 rounded-xl bg-[#9EEA6C] py-2.5 font-heading text-[12px] font-extrabold text-[#0a0a0a]">Enviar Chamado</button>
                            </div>
                        </form>
                    ) : selectedTicket ? (
                        <div className="flex h-full flex-col overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 px-3 py-2 dark:border-white/5 dark:bg-white/[0.01]">
                                <button onClick={() => setSelectedTicket(null)} className="rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/50">
                                    <X size={14} />
                                </button>
                                <span className="font-heading text-[12px] font-bold text-[#0a0a0a] dark:text-white truncate">{selectedTicket.subject}</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
                                {messages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-center">
                                        <p className="font-body text-[11px] text-neutral-400 dark:text-white/40">Nenhuma mensagem. Digite abaixo.</p>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.sender_id === profile.id;
                                        return (
                                            <div key={m.id} className={`flex max-w-[85%] flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                                                <div className={`rounded-2xl px-3.5 py-2 font-body text-[13px] ${isMe ? "bg-[#9EEA6C] text-[#0a0a0a] rounded-tr-sm" : "bg-neutral-100 dark:bg-white/[0.08] text-[#0a0a0a] dark:text-white/90 rounded-tl-sm"}`}>
                                                    {m.message}
                                                </div>
                                                <span className="mt-1 px-1 font-mono text-[9px] text-neutral-400 dark:text-white/30">
                                                    {new Date(m.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="border-t border-neutral-100 bg-white p-3 dark:border-white/5 dark:bg-[#0a0d10]">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-body text-[13px] text-[#0a0a0a] placeholder:text-neutral-400 focus:border-[#9EEA6C] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                                    />
                                    <button onClick={handleSend} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#9EEA6C] text-[#0a0a0a] transition-all hover:scale-105 active:scale-95">
                                        <ArrowUp size={16} weight="bold" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-white/5">
                                <h4 className="font-heading text-[13px] font-bold text-[#0a0a0a] dark:text-white">Meus Chamados</h4>
                                <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 rounded-md bg-[#9EEA6C]/20 px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-[#9EEA6C] hover:bg-[#9EEA6C]/30">
                                    <Plus size={10} weight="bold" /> Novo
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1.5">
                                {tickets.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center px-4">
                                        <ChatCircleDots size={32} weight="duotone" className="mb-2 text-neutral-300 dark:text-white/20" />
                                        <p className="font-body text-[12px] text-neutral-500 dark:text-white/40">Você ainda não abriu nenhum chamado.</p>
                                    </div>
                                ) : (
                                    tickets.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTicket(t)}
                                            className="flex flex-col rounded-xl border border-neutral-100 bg-white p-3 text-left transition hover:bg-neutral-50 dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                        >
                                            <div className="mb-1 flex w-full items-center justify-between">
                                                <span className="font-heading text-[13px] font-bold text-[#0a0a0a] dark:text-white truncate pr-2">{t.subject}</span>
                                                <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-body text-[9px] font-black uppercase tracking-wider ${t.status === 'open' ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400' : 'bg-[#9EEA6C]/20 text-[#006400] dark:text-[#9EEA6C]'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                            <span className="font-body text-[10px] text-neutral-400 dark:text-white/40">Atualizado em {new Date(t.updated_at).toLocaleDateString()}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
