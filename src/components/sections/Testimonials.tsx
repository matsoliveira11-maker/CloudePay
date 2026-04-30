import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";
import { TwitterLogo } from "phosphor-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "João Silva",
      handle: "@joaosilva",
      text: "A integração foi ridícula de tão fácil. Em 2 horas já estávamos recebendo em produção. O antifraude já salvou a gente algumas vezes.",
      img: "https://api.dicebear.com/7.x/notionists/svg?seed=Joao",
    },
    {
      name: "Mariana Costa",
      handle: "@maricosta",
      text: "Eu usava outra plataforma que retinha meu dinheiro por 14 dias. Com o CloudePay cai na hora e a taxa é metade. Surreal.",
      img: "https://api.dicebear.com/7.x/notionists/svg?seed=Mariana",
    },
    {
      name: "Pedro Alves",
      handle: "@pedrodev",
      text: "A melhor documentação de API de pagamentos no Brasil. Os webhooks nunca falham, e o suporte pelo Discord é animal.",
      img: "https://api.dicebear.com/7.x/notionists/svg?seed=Pedro",
    },
    {
      name: "Ana Neri",
      handle: "@ananeri",
      text: "Gero links de pagamento pros meus clientes pelo celular em 5 segundos. Acabou a dor de cabeça de conferir comprovante.",
      img: "https://api.dicebear.com/7.x/notionists/svg?seed=Ana",
    },
  ];

  return (
    <Section className="bg-neutral-950 text-white overflow-hidden" borderTop>
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Não acredite apenas em nós.</h2>
          <p className="text-xl text-neutral-400">Veja o que dizem milhares de usuários que já migraram.</p>
        </motion.div>

        {/* Scrollable horizontal container */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto pb-8 custom-scrollbar">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex gap-6 w-max"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="w-[350px] shrink-0">
                <Card className="p-8 h-full bg-neutral-900/50">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full bg-neutral-800" />
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-sm text-neutral-400">{t.handle}</p>
                    </div>
                    <TwitterLogo weight="fill" size={24} className="text-[#1DA1F2] ml-auto" />
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-lg">"{t.text}"</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
