import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

// The overall page frame: a sidebar of links + the current page content.
// On mobile the sidebar collapses behind a hamburger button.

const links = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/orders', label: 'Orders', icon: '🧾' },
]

export default function Layout() {
  const [open, setOpen] = useState(false) // mobile sidebar open?

  return (
    <div className="layout">
      {/* Top bar (visible mainly on mobile) */}
      <header className="topbar">
        <button
          className="hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <span className="topbar-title">Inventory & Orders</span>
      </header>

      {/* Sidebar navigation */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-icon">🏬</span>
          <span className="brand-text">IOMS</span>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Dark overlay behind the sidebar on mobile */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* The active page renders here */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
