import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ClipboardList, Package, Users } from 'lucide-react'
import { getProducts } from '../api/products'
import { getCustomers } from '../api/customers'
import { getOrders } from '../api/orders'
import { getErrorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

// Products at or below this stock level are flagged as "low stock".
const LOW_STOCK_THRESHOLD = 5

export default function Dashboard() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        // Fetch all three resources at the same time for speed.
        const [p, c, o] = await Promise.all([
          getProducts(),
          getCustomers(),
          getOrders(),
        ])
        if (!active) return
        setProducts(p)
        setCustomers(c)
        setOrders(o)
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [toast])

  if (loading) return <Spinner label="Loading dashboard…" />

  const lowStock = products
    .filter((p) => p.quantity_in_stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity_in_stock - b.quantity_in_stock)

  const stats = [
    { label: 'Products', value: products.length, Icon: Package, to: '/products', color: 'blue' },
    { label: 'Customers', value: customers.length, Icon: Users, to: '/customers', color: 'green' },
    { label: 'Orders', value: orders.length, Icon: ClipboardList, to: '/orders', color: 'purple' },
    { label: 'Low stock', value: lowStock.length, Icon: AlertTriangle, to: '/products', color: 'amber' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory and orders.</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`stat-card stat-${s.color}`}>
            <div className="stat-icon">
              <s.Icon size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Low stock products</h2>
          <span className="badge badge-amber">≤ {LOW_STOCK_THRESHOLD} in stock</span>
        </div>

        {lowStock.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All products are well stocked"
            hint="Nothing is at or below the low-stock threshold."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th className="num">In stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td className="num">
                      <span
                        className={`badge ${
                          p.quantity_in_stock === 0 ? 'badge-red' : 'badge-amber'
                        }`}
                      >
                        {p.quantity_in_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
