import {
  FlaskConical,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";


const PAGE_CONFIG: Record<
  string,
  {
    eyebrow: string;
    title: string;
  }
> = {
  "/": {
    eyebrow: "AI REVENUE RECOVERY",
    title: "Command Center",
  },

  "/transactions": {
    eyebrow: "PAYMENT RECOVERY",
    title: "Transactions",
  },

  "/recovery-agent": {
    eyebrow: "RECOVERY INTELLIGENCE",
    title: "Recovery Agent",
  },

  "/activity": {
    eyebrow: "AUDIT & OBSERVABILITY",
    title: "Activity",
  },

  "/guardrails": {
    eyebrow: "DETERMINISTIC SAFETY",
    title: "Guardrails",
  },

  "/settings": {
    eyebrow: "SYSTEM CONFIGURATION",
    title: "Settings",
  },
};


export default function Header() {
  const location =
    useLocation();

  const page =
    PAGE_CONFIG[
      location.pathname
    ] ??
    PAGE_CONFIG["/"];


  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">
          {page.eyebrow}
        </p>

        <h1>
          {page.title}
        </h1>
      </div>


      <div className="header-actions">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            minHeight: 42,
            padding: "0 12px",
            borderRadius: 11,
            border:
              "1px solid rgba(229,220,199,0.09)",
            background:
              "rgba(255,255,255,0.018)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              borderRadius: 9,
              background:
                "rgba(147,134,106,0.07)",
              color: "#B7AA89",
            }}
          >
            <FlaskConical
              size={14}
              strokeWidth={1.8}
            />
          </div>


          <div>
            <div
              style={{
                color: "#E5DCC7",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing:
                  "0.08em",
                lineHeight: 1.2,
              }}
            >
              TEST ENVIRONMENT
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#747B83",
                fontSize: 8,
                lineHeight: 1.2,
              }}
            >
              Backend-backed demo
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
