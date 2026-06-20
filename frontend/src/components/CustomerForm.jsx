import { useState } from 'react'

// Form for adding a customer.
export default function CustomerForm({ onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    // Basic email shape check; the backend validates strictly too.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <div className="field">
        <label>Full name</label>
        <input
          type="text"
          value={form.full_name}
          onChange={(e) => setField('full_name', e.target.value)}
          placeholder="e.g. Alex Smith"
          autoFocus
        />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}
      </div>

      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="e.g. alex@example.com"
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="field">
        <label>Phone <span className="optional">(optional)</span></label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="e.g. 9990001112"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Add customer'}
        </button>
      </div>
    </form>
  )
}
