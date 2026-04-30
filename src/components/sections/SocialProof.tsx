import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import Container from "../ui/Container";

export default function SocialProof() {
  const avatars = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Ane",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sophia",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Lucas",
  ];

  return (
    <section className="py-12 bg-black border-y border-neutral-900">
      <Container>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="flex flex-col items-center text-center gap-6"
        >
          <div className="flex -space-x-4">
            {avatars.map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-black bg-neutral-800" 
              />
            ))}
          </div>
          <div className="flex flex-col items-center">
            <p className="text-white text-lg font-medium">Mais que pagamentos, somos uma comunidade.</p>
            <a href="https://discord.gg/cloudepay" target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-400 text-sm mt-2 transition-colors">
              Junte-se a +12.000 autônomos no Discord &rarr;
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
