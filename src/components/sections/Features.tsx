import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";
import { ShieldCheck, Browsers, RocketLaunch, BellRinging, CurrencyDollar, ChartBar } from "phosphor-react";

export default function Features() {
  const features = [
    {
      icon: <ShieldCheck size={32} className="text-green-500" />,
      title: "Antifraude Nativo",
      desc: "Proteção de nível bancário em cada transação, sem custo adicional.",
    },
    {
      icon: <Browsers size={32} className="text-green-500" />,
      title: "Checkout Transparente",
      desc: "O cliente paga na sua página. Sem redirecionamentos confusos.",
    },
    {
      icon: <RocketLaunch size={32} className="text-green-500" />,
      title: "Saque Automático",
      desc: "Configure para receber automaticamente todos os dias na sua conta.",
    },
    {
      icon: <BellRinging size={32} className="text-green-500" />,
      title: "Notificações em Tempo Real",
      desc: "Saiba no exato segundo em que uma venda é aprovada via Webhooks.",
    },
    {
      icon: <CurrencyDollar size={32} className="text-green-500" />,
      title: "Split de Pagamentos",
      desc: "Divida o valor da venda com parceiros de forma automática.",
    },
    {
      icon: <ChartBar size={32} className="text-green-500" />,
      title: "Dashboard Analítico",
      desc: "Métricas que importam. Entenda seu negócio e venda mais.",
    },
  ];

  return (
    <Section id="features" className="bg-neutral-950 text-white" borderTop>
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Tudo incluído.</h2>
          <p className="text-xl text-neutral-400">Features poderosas para negócios que pensam grande, desde o primeiro dia.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="p-8 h-full bg-neutral-900/30">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-neutral-400">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
