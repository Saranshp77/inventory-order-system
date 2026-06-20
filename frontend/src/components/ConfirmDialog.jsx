import Modal from './Modal'

// A yes/no confirmation popup, used before deleting things.
export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
