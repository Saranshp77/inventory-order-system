import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Boxes,
  LayoutDashboard,
  Menu,
  Package,
  ClipboardList,
  Users,
} from 'lucide-react'

// The overall page frame: a sidebar of links + the current page content.
// On mobile the sidebar collapses behind a hamburger button.
// Icons are clean line-style SVGs from lucide-react.

const links = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', Icon: Package },
  { to: '/customers', label: 'Customers', Icon: Users },
  { to: '/orders', label: 'Orders', Icon: ClipboardList },
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
          <Menu size={20} />
        </button>
        <span className="topbar-title">Inventory & Orders</span>
      </header>

      {/* Sidebar navigation */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-icon">
            <Boxes size={20} />
          </span>
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
              <span className="nav-icon">
                <link.Icon size={18} />
              </span>
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
