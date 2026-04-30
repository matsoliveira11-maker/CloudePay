import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, scaleIn } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";

export default function Pricing() {
  const [value, setValue] = useState(100);
  const [method, setMethod] = useState<"pix" | "cartao">("pix");

  // CloudePay fee 2% for pix, maybe 4% for cartao (example)
  const feePercent = method === "pix" ? 0.02 : 0.04;
  const fee = value * feePercent;
  const net = value - fee;

  return (
    <Section className="bg-black text-white" borderTop>
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Você sabe exatamente quanto ganha.</h2>
          <p className="text-xl text-neutral-400">Sem surpresas. Taxa única por transação aprovada.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 md:p-12 bg-neutral-900/50">
            <div className="mb-10">
              <label className="block text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Você vende</label>
              <div className="flex items-center gap-4 text-5xl font-bold">
                <span className="text-neutral-500">R$</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="bg-transparent border-none outline-none w-full font-bold"
                  min="0"
                />
              </div>
              <input
                type="range"
                min="10"
                max="10000"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full mt-6 accent-green-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-2 mb-10 p-1 bg-neutral-950 rounded-xl w-fit">
              <button
                onClick={() => setMethod("pix")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  method === "pix" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
              >
                PIX
              </button>
              <button
                onClick={() => setMethod("cartao")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  method === "cartao" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
              >
                Cartão
              </button>
            </div>

            <div className="space-y-4 pt-8 border-t border-neutral-800">
              <div className="flex justify-between items-center text-lg">
                <span className="text-neutral-400">Taxa CloudePay ({(feePercent * 100).toFixed(1)}%)</span>
                <span className="text-red-400 font-medium">- R$ {fee.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between items-center text-3xl font-bold pt-4">
                <span>Você recebe</span>
                <span className="text-green-500">R$ {net.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </Container>
    </Section>
  );
}
