import { useEffect, useMemo, useState } from 'react'
import { getOrders, createOrder, deleteOrder } from '../api/orders'
import { getProducts } from '../api/products'
import { getCustomers } from '../api/customers'
import { getErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/format'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import OrderForm from '../components/OrderForm'

export default function Orders() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [busy, setBusy] = useState(false)

  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState(null) // order to view in detail
  const [deleting, setDeleting] = useState(null)

  async function load() {
    try {
      const [o, p, c] = await Promise.all([getOrders(), getProducts(), getCustomers()])
      setOrders(o)
      setProducts(p)
      setCustomers(c)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lookups so we can show names instead of raw id numbers.
  const customerMap = useMemo(() => {
    const m = {}
    customers.forEach((c) => (m[c.id] = c))
    return m
  }, [customers])

  const productMap = useMemo(() => {
    const m = {}
    products.forEach((p) => (m[p.id] = p))
    return m
  }, [products])

  function customerName(id) {
    return customerMap[id]?.full_name || `Customer #${id}`
  }

  async function handleCreate(data) {
    setBusy(true)
    try {
      const order = await createOrder(data)
      toast.success(`Order #${order.id} created — total ${formatCurrency(order.total_amount)}.`)
      setCreating(false)
      await load() // refresh orders AND product stock
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteOrder(deleting.id)
      toast.success(`Order #${deleting.id} deleted — stock restored.`)
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">Create and review customer orders.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + New order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner label="Loading orders…" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No orders yet"
            hint="Click “New order” to create one."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th className="num">Items</th>
                  <th className="num">Total</th>
                  <th>Date</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{customerName(o.customer_id)}</td>
                    <td className="num">{o.items.length}</td>
                    <td className="num">{formatCurrency(o.total_amount)}</td>
                    <td>{formatDate(o.created_at)}</td>
                    <td className="actions-col">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setViewing(o)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-danger-ghost"
                        onClick={() => setDeleting(o)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create order */}
      {creating && (
        <Modal title="New order" onClose={() => !busy && setCreating(false)} width={640}>
          <OrderForm
            customers={customers}
            products={products}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            busy={busy}
          />
        </Modal>
      )}

      {/* Order details */}
      {viewing && (
        <Modal
          title={`Order #${viewing.id}`}
          onClose={() => setViewing(null)}
          width={560}
        >
          <div className="detail-meta">
            <div>
              <span className="detail-label">Customer</span>
              <span>{customerName(viewing.customer_id)}</span>
            </div>
            <div>
              <span className="detail-label">Date</span>
              <span>{formatDate(viewing.created_at)}</span>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="num">Unit price</th>
                  <th className="num">Qty</th>
                  <th className="num">Line total</th>
                </tr>
              </thead>
              <tbody>
                {viewing.items.map((item) => {
                  const prod = productMap[item.product_id]
                  return (
                    <tr key={item.id}>
                      <td>{prod ? prod.name : `Product #${item.product_id}`}</td>
                      <td className="num">{formatCurrency(item.unit_price)}</td>
                      <td className="num">{item.quantity}</td>
                      <td className="num">
                        {formatCurrency(Number(item.unit_price) * item.quantity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="order-total-row">
            <span>Total</span>
            <span className="order-total-amount">
              {formatCurrency(viewing.total_amount)}
            </span>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setViewing(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <ConfirmDialog
          title="Delete order"
          message={`Delete order #${deleting.id}? The products will be returned to stock.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  )
}
