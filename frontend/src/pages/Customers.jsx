import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api/customers'
import { getErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import CustomerForm from '../components/CustomerForm'

export default function Customers() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    try {
      setCustomers(await getCustomers())
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

  async function handleSave(data) {
    setBusy(true)
    try {
      await createCustomer(data)
      toast.success('Customer added.')
      setAdding(false)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteCustomer(deleting.id)
      toast.success('Customer deleted.')
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
          <h1>Customers</h1>
          <p className="page-subtitle">People who place orders.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          + Add customer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner label="Loading customers…" />
        ) : customers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No customers yet"
            hint="Click “Add customer” to create your first one."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Full name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td className="actions-col">
                      <button
                        className="btn btn-sm btn-danger-ghost"
                        onClick={() => setDeleting(c)}
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

      {adding && (
        <Modal title="Add customer" onClose={() => !busy && setAdding(false)}>
          <CustomerForm
            onSubmit={handleSave}
            onCancel={() => setAdding(false)}
            busy={busy}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete customer"
          message={`Delete “${deleting.full_name}” (${deleting.email})? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  )
}
