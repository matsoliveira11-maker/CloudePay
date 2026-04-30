import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import { Plus, Minus } from "phosphor-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Preciso ter CNPJ?",
      a: "Não! O CloudePay foi feito pra autônomo. Você cria a conta só com CPF e já recebe pagamentos na hora.",
    },
    {
      q: "Quanto tempo leva pra cair?",
      a: "O PIX cai na hora. Cartão de crédito pode levar até 2 dias úteis na configuração padrão, ou na hora com antecipação.",
    },
    {
      q: "Tem mensalidade?",
      a: "Zero. Cobramos apenas uma pequena taxa por transação aprovada. Se você não vendeu, não paga nada.",
    },
    {
      q: "O cliente precisa baixar algum app?",
      a: "Não. Ele abre seu link de pagamento direto no navegador do celular ou computador dele.",
    },
    {
      q: "Como recebo o dinheiro?",
      a: "Os valores ficam disponíveis na sua carteira CloudePay e você pode sacar para sua conta bancária a qualquer momento, ou configurar o saque automático.",
    },
    {
      q: "É seguro?",
      a: "Sim. Usamos os mesmos padrões de criptografia dos grandes bancos. Seus dados e os dados dos seus clientes estão 100% seguros.",
    },
  ];

  return (
    <Section className="bg-black text-white" borderTop>
      <Container>
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Perguntas Frequentes</h2>
            <p className="text-xl text-neutral-400 mb-8">
              E tudo isso com suporte que não te deixa na mão.
            </p>
            <a href="mailto:suporte@cloudepay.com.br" className="text-green-500 hover:text-green-400 transition-colors font-medium">
              Falar com o suporte &rarr;
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`border rounded-2xl overflow-hidden transition-colors ${openIndex === i ? 'border-green-500/50 bg-green-500/5' : 'border-neutral-800 bg-neutral-900/30'}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold">{faq.q}</span>
                  {openIndex === i ? (
                    <Minus size={20} className="text-green-500 shrink-0" />
                  ) : (
                    <Plus size={20} className="text-neutral-500 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-neutral-400 text-lg leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
