import React from 'react'

export default function Header({ onOpenTutorial }) {
  return (
    <header className="app-header" role="banner">
      <div className="brand">
        <div className="brand-icon">⚖️</div>
        <div>
          <div className="brand-title">Objection! — AI Debate Arena</div>
          <div className="brand-sub">Practice. Learn. Persuade.</div>
        </div>
      </div>

      <nav className="header-actions" role="navigation">
        <button className="btn btn-primary small" onClick={onOpenTutorial}>How it works</button>
      </nav>
    </header>
  )
}
