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

import {
  motion,
} from "motion/react";

import LogoutButton from "./auth/LogoutButton";


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

      {/* ================================================= */}
      {/* BRAND                                             */}
      {/* ================================================= */}

      <div className="brand">

        {/* PREMIUM ROTATING LOGO */}

        <div
          style={{
            position: "relative",

            width: 50,

            height: 50,

            display: "grid",

            placeItems: "center",

            flexShrink: 0,
          }}
        >

          {/* SOFT OUTER GLOW */}

          <div
            style={{
              position: "absolute",

              inset: 2,

              borderRadius: "50%",

              background:
                "rgba(196, 158, 96, 0.13)",

              filter: "blur(9px)",
            }}
          />


          {/* ROTATING GOLD SHINE */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4,

              repeat: Infinity,

              ease: "linear",
            }}
            style={{
              position: "absolute",

              inset: 0,

              borderRadius: "50%",

              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(229,220,199,0.08) 70deg, rgba(218,174,103,0.95) 130deg, rgba(255,224,170,1) 165deg, rgba(218,174,103,0.55) 205deg, transparent 270deg)",
            }}
          />


          {/* DARK INNER MASK */}

          <div
            style={{
              position: "absolute",

              inset: 3,

              borderRadius: "50%",

              background: "#080B0F",
            }}
          />


          {/* SECOND SUBTLE BORDER */}

          <div
            style={{
              position: "absolute",

              inset: 5,

              borderRadius: "50%",

              border:
                "1px solid rgba(229,220,199,0.10)",
            }}
          />


          {/* ACTUAL R LOGO */}

          <div
            className="brand-mark"
            style={{
              position: "relative",

              zIndex: 3,

              width: 38,

              height: 38,

              display: "grid",

              placeItems: "center",

              borderRadius: 10,

              background: "#E5DCC7",

              color: "#171813",

              fontSize: 15,

              fontWeight: 800,

              boxShadow:
                "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            R
          </div>

        </div>


        {/* BRAND TEXT */}

        <div>

          <h2>
            RecoverAI
          </h2>

          <span>
            Revenue Recovery
          </span>

        </div>

      </div>


      {/* ================================================= */}
      {/* NAVIGATION                                        */}
      {/* ================================================= */}

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


      {/* ================================================= */}
      {/* FOOTER                                            */}
      {/* ================================================= */}

      <div className="sidebar-footer">

        <LogoutButton />

      </div>

    </aside>
  );
}