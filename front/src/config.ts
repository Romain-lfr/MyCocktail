// URL de base de l'API : '/api' en dev (proxy Vite vers localhost:3000), URL Render en prod (VITE_API_URL).
export const API_URL = import.meta.env.VITE_API_URL ?? '/api';
