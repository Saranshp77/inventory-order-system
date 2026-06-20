import axios from 'axios'

// One shared Axios instance for the whole app.
// The base URL comes from the VITE_API_URL environment variable so we can
// point the app at a different backend (e.g. production) without code changes.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Turn backend errors into a single readable message string.
// FastAPI returns errors as { detail: "..." } or { detail: [ {msg, loc}, ... ] }.
export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (!detail) {
    return error?.message || 'Something went wrong. Is the backend running?'
  }
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    // Validation errors (422): combine the field + message for each problem.
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
        return field ? `${field}: ${d.msg}` : d.msg
      })
      .join(' • ')
  }
  return 'Request failed.'
}

export default client
