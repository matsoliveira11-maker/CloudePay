import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../lib/animations";
import Button from "../ui/Button";
import Container from "../ui/Container";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-black text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >

          
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Receba fácil.<br />
            <span className="text-green-500">Cresça rápido.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl leading-relaxed">
            Sem maquininha, sem burocracia, sem taxa surpresa. Crie seu link de pagamento em segundos e receba na hora.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button to="/cadastro" size="lg" className="w-full sm:w-auto text-lg">
              Começar Agora
            </Button>
            <Button href="#features" variant="outline" size="lg" className="w-full sm:w-auto text-lg">
              Por que usar?
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
