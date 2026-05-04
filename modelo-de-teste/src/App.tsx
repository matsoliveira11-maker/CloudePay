import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import SandboxBanner from "./components/SandboxBanner";
import Topbar from "./components/Topbar";
import PeriodTabs from "./components/PeriodTabs";
import KpiCards from "./components/KpiCards";
import PaymentMethods from "./components/PaymentMethods";
import SalesChart from "./components/SalesChart";
import TicketChart from "./components/TicketChart";
import StatusDistribution from "./components/StatusDistribution";
import SalesCalendar from "./components/SalesCalendar";
import SalesHistory from "./components/SalesHistory";
import CreateChargeModal from "./components/CreateChargeModal";
import { initialCharges, type Charge } from "./data";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [period, setPeriod] = useState("month");
  const [charges, setCharges] = useState<Charge[]>(initialCharges);
  const [modal, setModal] = useState(false);

  const stats = useMemo(() => {
    const paid = charges.filter(c => c.status === "paid");
    const gross = paid.reduce((s, c) => s + c.gross, 0);
    return {
      gross,
      avgTicket: paid.length ? gross / paid.length : 0,
      total: charges.length,
    };
  }, [charges]);

  function handleCreate(data: Omit<Charge, "id" | "date" | "status">) {
    setCharges(prev => [{
      ...data,
      id: Math.random().toString(36).slice(2),
      status: "pending",
      date: new Date().toISOString(),
    }, ...prev]);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f7f5" }}>
      <SandboxBanner />

      <div className="flex flex-1 min-h-0">
        <Sidebar active={active} onNavigate={setActive} />

        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <Topbar onCreate={() => setModal(true)} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-8 max-w-[1320px] w-full mx-auto space-y-5">

            {/* Period Tabs */}
            <div className="a-up">
              <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            {/* KPI Cards */}
            <KpiCards
              gross={stats.gross}
              total={stats.total}
              avgTicket={stats.avgTicket}
            />

            {/* Payment Methods */}
            <div className="a-up-1">
              <PaymentMethods charges={charges} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="a-up-2">
                <SalesChart charges={charges} />
              </div>
              <div className="a-up-3">
                <TicketChart charges={charges} />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="a-up-4">
                <StatusDistribution charges={charges} />
              </div>
              <div className="a-up-5">
                <SalesCalendar />
              </div>
            </div>

            {/* Sales History */}
            <div className="a-up-6">
              <SalesHistory charges={charges} />
            </div>

          </main>
        </div>
      </div>

      <CreateChargeModal open={modal} onClose={() => setModal(false)} onCreate={handleCreate} />
    </div>
  );
}
