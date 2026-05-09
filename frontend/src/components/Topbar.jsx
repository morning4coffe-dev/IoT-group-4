import React from "react";

export function Topbar({ onNavigate, onToggleTheme }) {
  return (
    <header className="topbar">
      <button className="brand brand-button" type="button" onClick={() => onNavigate("dashboard")} aria-label="Greenhouse Monitor dashboard">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M19 3c-6.8.2-11.9 4.2-12.7 10.4-.5 3.7 1.7 6.8 5 7.6v-5.1l-2.9 1.8 1.2-3.2 1.7-1.1v-2.9h2.2v1.5l3.8-2.4-1.2 3.2-2.6 1.7V21c3.9-.7 6.7-4.1 6.7-8.3 0-2.5-.7-5.9-1.2-9.7Z" />
          </svg>
        </span>
        <span>Greenhouse Monitor</span>
      </button>
      <div className="top-actions">
        <button className="icon-button" type="button" aria-label="Toggle theme" onClick={onToggleTheme}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>
      </div>
    </header>
  );
}
