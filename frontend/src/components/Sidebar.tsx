import {
  LayoutDashboard,
  CreditCard,
  Bot,
  Activity,
  ShieldCheck,
  Settings,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Transactions",
    icon: CreditCard,
    path: "/transactions",
  },
  {
    label: "Recovery Agent",
    icon: Bot,
    path: "/recovery-agent",
  },
  {
    label: "Activity",
    icon: Activity,
    path: "/activity",
  },
  {
    label: "Guardrails",
    icon: ShieldCheck,
    path: "/guardrails",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];


export default function Sidebar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          R
        </div>

        <div>
          <h2>RecoverAI</h2>
          <span>
            Revenue Recovery
          </span>
        </div>
      </div>


      <nav className="nav-list">
        {navItems.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              location.pathname ===
              item.path;

            return (
              <button
                key={
                  item.label
                }
                type="button"
                className={`nav-item ${
                  active
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  navigate(
                    item.path,
                  )
                }
              >
                <Icon
                  size={18}
                />

                <span>
                  {item.label}
                </span>
              </button>
            );
          },
        )}
      </nav>


      <div className="sidebar-footer">
        <div className="environment-dot" />

        <span>
          Test Environment
        </span>
      </div>
    </aside>
  );
}