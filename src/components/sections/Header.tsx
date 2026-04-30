import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-neutral-900 py-4" : "bg-transparent py-6"}`}>
      <Container>
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            CloudePay
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Produtos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#developers" className="hover:text-white transition-colors">Documentação</a>
            <a href="#" className="hover:text-white transition-colors">Blog</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/entrar" className="text-sm font-medium text-white hover:text-green-500 transition-colors hidden sm:block">
              Entrar
            </Link>
            <Button to="/cadastro" size="sm" className="hidden sm:inline-flex">
              Começar Agora
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
