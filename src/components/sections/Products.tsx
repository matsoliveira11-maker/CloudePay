import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";
import { QrCode, CreditCard, LinkSimple, CurrencyCircleDollar } from "phosphor-react";

export default function Products() {
  const products = [
    {
      icon: <CurrencyCircleDollar size={40} weight="duotone" className="text-green-500" />,
      title: "PIX",
      desc: "Pagamentos instantâneos diretos na sua conta, 24/7.",
    },
    {
      icon: <CreditCard size={40} weight="duotone" className="text-green-500" />,
      title: "Cartão de Crédito",
      desc: "Aceite as principais bandeiras e parcele para seus clientes.",
    },
    {
      icon: <QrCode size={40} weight="duotone" className="text-green-500" />,
      title: "QR Code Fixo",
      desc: "Imprima e cole no seu balcão para pagamentos rápidos.",
    },
    {
      icon: <LinkSimple size={40} weight="duotone" className="text-green-500" />,
      title: "Link Personalizado",
      desc: "cloudepay.com.br/voce. Envie por WhatsApp ou Instagram.",
    },
  ];

  return (
    <Section className="bg-neutral-950 text-white" borderTop>
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Tudo que você precisa pra vender.</h2>
          <p className="text-xl text-neutral-400">Produtos feitos para maximizar sua conversão, não importa onde você venda.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((p, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card hover className="p-8 h-full bg-neutral-900/50">
                <div className="mb-6">{p.icon}</div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{p.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
