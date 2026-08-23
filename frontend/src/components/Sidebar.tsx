import {
  LayoutDashboard,
  CreditCard,
  Bot,
  Activity,
  ShieldCheck,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Transactions", icon: CreditCard },
  { label: "Recovery Agent", icon: Bot },
  { label: "Activity", icon: Activity },
  { label: "Guardrails", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div>
          <h2>RecoverAI</h2>
          <span>Revenue Recovery</span>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`nav-item ${index === 0 ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="environment-dot" />
        <span>Test Environment</span>
      </div>
    </aside>
  );
}