// Petits outils partagés pour parler à l'API (toujours via axios et des chemins /api/...).

/** Options d'une requête authentifiée : le token est lu au moment de l'appel. */
export const avecToken = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

/** Pour les routes publiques : envoie le token s'il y en a un, rien pour un visiteur. */
export const tokenSiConnecte = () => {
  const token = localStorage.getItem("token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

/** Message d'erreur renvoyé par l'API (`response.data.message`), s'il y en a un. */
export const messageApi = (err: unknown): string | undefined => {
  const message = (err as { response?: { data?: { message?: unknown } } } | null)?.response?.data?.message;
  return typeof message === "string" ? message : undefined;
};
