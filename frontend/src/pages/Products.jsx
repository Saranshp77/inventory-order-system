import { useEffect, useState } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products'
import { getErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/format'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ProductForm from '../components/ProductForm'

export default function Products() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [busy, setBusy] = useState(false)

  // Which modal is open (if any)
  const [editing, setEditing] = useState(null) // null = closed, {} = add, product = edit
  const [deleting, setDeleting] = useState(null) // product to delete

  async function load() {
    try {
      setProducts(await getProducts())
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
      if (editing && editing.id) {
        await updateProduct(editing.id, data)
        toast.success('Product updated.')
      } else {
        await createProduct(data)
        toast.success('Product added.')
      }
      setEditing(null)
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
      await deleteProduct(deleting.id)
      toast.success('Product deleted.')
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
          <h1>Products</h1>
          <p className="page-subtitle">Manage your inventory items.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Add product
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner label="Loading products…" />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products yet"
            hint="Click “Add product” to create your first item."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th className="num">Price</th>
                  <th className="num">In stock</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td className="num">{formatCurrency(p.price)}</td>
                    <td className="num">
                      <span
                        className={`badge ${
                          p.quantity_in_stock === 0
                            ? 'badge-red'
                            : p.quantity_in_stock <= 5
                            ? 'badge-amber'
                            : 'badge-green'
                        }`}
                      >
                        {p.quantity_in_stock}
                      </span>
                    </td>
                    <td className="actions-col">
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger-ghost"
                        onClick={() => setDeleting(p)}
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

      {editing && (
        <Modal
          title={editing.id ? 'Edit product' : 'Add product'}
          onClose={() => !busy && setEditing(null)}
        >
          <ProductForm
            initial={editing.id ? editing : null}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            busy={busy}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete “${deleting.name}” (SKU ${deleting.sku})? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  )
}
