import { Bell, Search } from "lucide-react";
import AgentStatus from "./AgentStatus";

export default function Header() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">AI REVENUE RECOVERY</p>
        <h1>Command Center</h1>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search transactions..." />
        </div>

        <button className="icon-button">
          <Bell size={18} />
        </button>

        <AgentStatus />
      </div>
    </header>
  );
}