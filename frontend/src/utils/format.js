// Format a number as US dollars, e.g. 89.5 -> "$89.50".
export function formatCurrency(value) {
  const num = Number(value || 0)
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// Format an ISO date string into something readable, e.g. "Jun 19, 2026, 10:27 AM".
export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
