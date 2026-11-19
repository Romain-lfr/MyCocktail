// Règles d'affichage des publicités (AdSense), partagées par AdSlot et les pages qui réservent un emplacement.

// Identifiant éditeur AdSense (ca-pub-XXXXXXXXXXXXXXXX), défini dans le fichier .env
export const CLIENT_ADSENSE = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

export const estMineur = () => localStorage.getItem("estMineur") === "true";

/** Vrai si un emplacement doit être réservé dans la page (évite de laisser un trou vide). */
export function pubAutorisee(slot?: string): boolean {
  if (estMineur()) return false;
  return import.meta.env.DEV || (!!CLIENT_ADSENSE && !!slot);
}
