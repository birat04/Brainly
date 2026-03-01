export const BackendURL = 
  import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.origin) || 
  "http://localhost:3000";
