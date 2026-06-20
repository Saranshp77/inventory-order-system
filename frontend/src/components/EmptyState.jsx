// Shown when a list has no items yet, so the screen never looks broken/empty.
export default function EmptyState({ icon = '📭', title, hint }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  )
}
