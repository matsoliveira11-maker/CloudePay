import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";
import { Lightning, ShieldCheck, Headset } from "phosphor-react";

export default function ValueProps() {
  const props = [
    {
      icon: <Lightning size={32} weight="duotone" className="text-green-500" />,
      title: "Rápido",
      desc: "Receba em segundos, não horas.",
    },
    {
      icon: <ShieldCheck size={32} weight="duotone" className="text-green-500" />,
      title: "Seguro",
      desc: "Criptografia e conformidade LGPD.",
    },
    {
      icon: <Headset size={32} weight="duotone" className="text-green-500" />,
      title: "Suporte",
      desc: "Humano e rápido, de verdade.",
    },
  ];

  return (
    <Section className="bg-black text-white">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto"
        >
          {props.map((p, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card hover className="p-8 text-center flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{p.title}</h3>
                <p className="text-neutral-400">{p.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
