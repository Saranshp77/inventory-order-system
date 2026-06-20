import { useState } from 'react'

// Form for both adding and editing a product.
// `initial` is empty for "add", or a product object for "edit".
export default function ProductForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    sku: initial?.sku ?? '',
    price: initial?.price ?? '',
    quantity_in_stock: initial?.quantity_in_stock ?? '',
  })
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // Check the inputs before sending to the backend.
  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.sku.trim()) e.sku = 'SKU is required.'
    if (form.price === '' || isNaN(form.price)) e.price = 'Price must be a number.'
    else if (Number(form.price) < 0) e.price = 'Price cannot be negative.'
    if (form.quantity_in_stock === '' || !Number.isInteger(Number(form.quantity_in_stock)))
      e.quantity_in_stock = 'Quantity must be a whole number.'
    else if (Number(form.quantity_in_stock) < 0)
      e.quantity_in_stock = 'Quantity cannot be negative.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <div className="field">
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Wireless Mouse"
          autoFocus
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="field">
        <label>SKU</label>
        <input
          type="text"
          value={form.sku}
          onChange={(e) => setField('sku', e.target.value)}
          placeholder="e.g. MOU-001"
        />
        {errors.sku && <span className="field-error">{errors.sku}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label>Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="field">
          <label>Quantity in stock</label>
          <input
            type="number"
            step="1"
            min="0"
            value={form.quantity_in_stock}
            onChange={(e) => setField('quantity_in_stock', e.target.value)}
            placeholder="0"
          />
          {errors.quantity_in_stock && (
            <span className="field-error">{errors.quantity_in_stock}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
