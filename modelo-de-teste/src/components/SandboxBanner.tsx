import { FlaskConical } from "lucide-react";

export default function SandboxBanner() {
  return (
    <div className="w-full flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2"
      style={{ background: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)" }}>
      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
        <FlaskConical className="w-3 h-3 text-[#be123c]" />
      </div>
      <span className="text-[12px] font-medium text-[#be123c]">Sandbox Mode · Você está em um ambiente de teste</span>
    </div>
  );
}
