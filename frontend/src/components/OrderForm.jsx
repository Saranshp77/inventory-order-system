import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/format'

// Form to create a new order:
// - pick a customer
// - add one or more product lines (product + quantity)
// - the total is calculated live as you type
//
// `customers` and `products` are passed in from the Orders page.
export default function OrderForm({ customers, products, onSubmit, onCancel, busy }) {
  const [customerId, setCustomerId] = useState('')
  // Each line: { key, productId, quantity }
  const [lines, setLines] = useState([{ key: 1, productId: '', quantity: 1 }])
  const [errors, setErrors] = useState({})

  // Quick lookup of product details by id.
  const productMap = useMemo(() => {
    const m = {}
    products.forEach((p) => (m[p.id] = p))
    return m
  }, [products])

  function addLine() {
    setLines((ls) => [...ls, { key: Date.now(), productId: '', quantity: 1 }])
  }

  function removeLine(key) {
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls))
  }

  function updateLine(key, field, value) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [field]: value } : l)))
  }

  // Live total: sum of (price × quantity) for each valid line.
  const total = useMemo(() => {
    return lines.reduce((sum, l) => {
      const p = productMap[l.productId]
      const qty = Number(l.quantity)
      if (!p || !qty || qty < 0) return sum
      return sum + Number(p.price) * qty
    }, 0)
  }, [lines, productMap])

  function validate() {
    const e = {}
    if (!customerId) e.customer = 'Please select a customer.'

    const chosen = lines.filter((l) => l.productId)
    if (chosen.length === 0) e.lines = 'Add at least one product.'

    lines.forEach((l) => {
      if (!l.productId) return
      const p = productMap[l.productId]
      const qty = Number(l.quantity)
      if (!Number.isInteger(qty) || qty <= 0) {
        e[`qty-${l.key}`] = 'Quantity must be a whole number above 0.'
      } else if (p && qty > p.quantity_in_stock) {
        e[`qty-${l.key}`] = `Only ${p.quantity_in_stock} in stock.`
      }
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return

    // Combine lines into the shape the backend expects.
    const items = lines
      .filter((l) => l.productId)
      .map((l) => ({ product_id: Number(l.productId), quantity: Number(l.quantity) }))

    onSubmit({ customer_id: Number(customerId), items })
  }

  const noCustomers = customers.length === 0
  const noProducts = products.length === 0

  if (noCustomers || noProducts) {
    return (
      <div className="form">
        <p className="confirm-message">
          You need at least one customer and one product before creating an order.
          {noCustomers && ' Add a customer first.'}
          {noProducts && ' Add a product first.'}
        </p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <div className="field">
        <label>Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">— Select a customer —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} ({c.email})
            </option>
          ))}
        </select>
        {errors.customer && <span className="field-error">{errors.customer}</span>}
      </div>

      <label className="lines-label">Products</label>
      {errors.lines && <span className="field-error">{errors.lines}</span>}

      <div className="order-lines">
        {lines.map((l) => {
          const p = productMap[l.productId]
          const lineTotal = p ? Number(p.price) * Number(l.quantity || 0) : 0
          return (
            <div className="order-line" key={l.key}>
              <div className="order-line-product">
                <select
                  value={l.productId}
                  onChange={(e) => updateLine(l.key, 'productId', e.target.value)}
                >
                  <option value="">— Select product —</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} — {formatCurrency(prod.price)} ({prod.quantity_in_stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-line-qty">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={l.quantity}
                  onChange={(e) => updateLine(l.key, 'quantity', e.target.value)}
                  aria-label="Quantity"
                />
              </div>

              <div className="order-line-total">{formatCurrency(lineTotal)}</div>

              <button
                type="button"
                className="btn btn-sm btn-danger-ghost order-line-remove"
                onClick={() => removeLine(l.key)}
                disabled={lines.length === 1}
                aria-label="Remove line"
              >
                ✕
              </button>

              {errors[`qty-${l.key}`] && (
                <span className="field-error line-error">{errors[`qty-${l.key}`]}</span>
              )}
            </div>
          )
        })}
      </div>

      <button type="button" className="btn btn-sm btn-ghost add-line-btn" onClick={addLine}>
        + Add another product
      </button>

      <div className="order-total-row">
        <span>Total</span>
        <span className="order-total-amount">{formatCurrency(total)}</span>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Placing order…' : 'Create order'}
        </button>
      </div>
    </form>
  )
}
