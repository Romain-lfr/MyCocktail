/**
 * Lit l'identifiant du compte (`sub`) dans un JWT, sans vérifier la signature
 * (c'est le back qui la vérifie). Le contenu d'un JWT est encodé en base64url
 * (`-` et `_` au lieu de `+` et `/`), que `atob` ne sait pas lire tel quel.
 * Renvoie null si le token est absent ou illisible.
 */
export function idCompteDuToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const contenu = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return typeof contenu.sub === "string" ? contenu.sub : null;
  } catch {
    return null;
  }
}
