import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import Container from "../ui/Container";
import Button from "../ui/Button";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Final CTA */}
      <div className="py-24 border-t border-neutral-900">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">Pronto para começar?</h2>
            <p className="text-xl text-neutral-400 mb-10">Você chegou no fim. Se tá interessado, cadastra.</p>
            <Button to="/cadastro" size="lg" className="w-full sm:w-auto text-xl py-4 px-10">
              Criar Conta Grátis
            </Button>
          </motion.div>
        </Container>
      </div>

      {/* Main Footer */}
      <div className="py-12 border-t border-neutral-900 bg-neutral-950">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="font-bold text-2xl mb-4 tracking-tight">CloudePay.</div>
              <p className="text-neutral-400 max-w-sm">
                A infraestrutura de pagamentos feita para quem quer velocidade, segurança e conversão, sem as taxas absurdas.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#" className="hover:text-green-500 transition">PIX</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Cartão</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Preços</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Integrações</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#" className="hover:text-green-500 transition">Sobre</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Blog</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Carreiras</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#" className="hover:text-green-500 transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Compliance</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-neutral-900 text-neutral-500 text-sm">
            <p>&copy; {new Date().getFullYear()} CloudePay. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
