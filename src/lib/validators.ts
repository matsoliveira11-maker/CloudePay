// Validações reutilizáveis. CPF com algoritmo real (dígitos verificadores).

export function sanitizeDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export function formatCPF(value: string): string {
  const d = sanitizeDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function isValidCPF(value: string): boolean {
  const cpf = sanitizeDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (slice: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (factorStart - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(cpf.slice(0, 9), 10);
  if (d1 !== parseInt(cpf[9], 10)) return false;
  const d2 = calcDigit(cpf.slice(0, 10), 11);
  if (d2 !== parseInt(cpf[10], 10)) return false;
  return true;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

export function isValidSlug(value: string): boolean {
  // letras minúsculas, números e hífen — entre 3 e 30 chars, sem hífen no começo/fim
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(value || "");
}

export function normalizeSlug(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Sanitização básica de texto livre (descrições, nomes)
export function sanitizeText(value: string, maxLen = 200): string {
  return (value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

// Slugs reservados — não podem ser usados como link público
export const RESERVED_SLUGS = new Set([
  "app", "api", "admin", "login", "signup", "cadastro", "entrar",
  "dashboard", "painel", "configuracoes", "settings", "onboarding",
  "sobre", "contato", "termos", "privacidade", "ajuda", "suporte",
  "linknode", "pix", "pagar", "pagamento", "checkout", "webhook",
  "static", "assets", "public", "_next", "favicon",
]);
