// The backend URL is resolved in this priority order:
// 1. VITE_API_URL from a .env file — set this when the frontend and backend
//    are on different hosts entirely (e.g. two separate ngrok tunnels, or a
//    real deployment). See .env.example.
// 2. Otherwise, assume the backend is on the same host as the page, port
//    5000 — this covers plain localhost and LAN/phone testing automatically,
//    with zero configuration.
const configuredOrigin = import.meta.env.VITE_API_URL;

export const API_ORIGIN = configuredOrigin || `http://${window.location.hostname}:5000`;
export const API_BASE_URL = `${API_ORIGIN}/api`;
