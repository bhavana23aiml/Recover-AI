import {
  Bell,
  Search,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";

import AgentStatus from "./AgentStatus";


const PAGE_CONFIG: Record<
  string,
  {
    eyebrow: string;
    title: string;
    searchPlaceholder: string;
  }
> = {
  "/": {
    eyebrow: "AI REVENUE RECOVERY",
    title: "Command Center",
    searchPlaceholder:
      "Search transactions...",
  },

  "/transactions": {
    eyebrow: "PAYMENT RECOVERY",
    title: "Transactions",
    searchPlaceholder:
      "Search transactions...",
  },

  "/recovery-agent": {
    eyebrow: "AUTONOMOUS RECOVERY",
    title: "Recovery Agent",
    searchPlaceholder:
      "Search recovery activity...",
  },

  "/activity": {
    eyebrow: "AUDIT & OBSERVABILITY",
    title: "Activity",
    searchPlaceholder:
      "Search activity...",
  },

  "/guardrails": {
    eyebrow: "DETERMINISTIC SAFETY",
    title: "Guardrails",
    searchPlaceholder:
      "Search safety policies...",
  },

  "/settings": {
    eyebrow: "SYSTEM CONFIGURATION",
    title: "Settings",
    searchPlaceholder:
      "Search settings...",
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
        <div className="search-box">
          <Search
            size={17}
          />

          <input
            placeholder={
              page.searchPlaceholder
            }
            aria-label={
              page.searchPlaceholder
            }
          />
        </div>


        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell
            size={18}
          />
        </button>


        <AgentStatus />
      </div>
    </header>
  );
}