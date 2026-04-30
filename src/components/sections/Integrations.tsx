import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function Integrations() {
  const sdks = ["Node.js", "Python", "PHP", "Ruby", "Go", "Java"];

  return (
    <Section className="bg-black text-white" borderTop>
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Feito para <span className="text-green-500">Desenvolvedores</span>.</h2>
            <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
              Integre pagamentos na sua aplicação em minutos. Documentação clara, SDKs oficiais e ambiente de testes robusto.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {sdks.map((sdk) => (
                <div key={sdk} className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm font-medium">
                  {sdk}
                </div>
              ))}
            </div>
            <Button variant="outline" size="lg">
              Ler Documentação API
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <Card className="p-6 bg-neutral-950 font-mono text-sm border-neutral-800">
              <div className="flex gap-2 mb-4 pb-4 border-b border-neutral-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-neutral-400 overflow-x-auto">
                <code className="language-javascript">
                  <span className="text-purple-400">const</span> cloudepay = <span className="text-blue-400">require</span>(<span className="text-green-400">'cloudepay'</span>);{'\n\n'}
                  <span className="text-purple-400">const</span> payment = <span className="text-purple-400">await</span> cloudepay.charge.<span className="text-blue-400">create</span>({`{`}{'\n'}
                  {'  '}amount: <span className="text-orange-400">10000</span>, <span className="text-neutral-500">// R$ 100,00</span>{'\n'}
                  {'  '}method: <span className="text-green-400">'pix'</span>,{'\n'}
                  {'  '}customer: {'{'} email: <span className="text-green-400">'cliente@email.com'</span> {'}'}{'\n'}
                  {"});"}{'\n\n'}
                  <span className="text-blue-400">console</span>.<span className="text-blue-400">log</span>(payment.qrcode);
                </code>
              </pre>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
