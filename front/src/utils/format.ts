// Mise en forme à la française des nombres affichés.

/** 1.5 → « 1,5 » ; au plus 2 décimales. */
export const formatQuantite = (q: number) => Number(q).toLocaleString("fr-FR", { maximumFractionDigits: 2 });

/** Moyenne des notes d'une liste d'avis (0 sans avis). */
export const noteMoyenne = (avis: { noteavis: number }[]) =>
  avis.length ? avis.reduce((s, a) => s + a.noteavis, 0) / avis.length : 0;

/** 4.5 → « 4,5 » (toujours une décimale). */
export const formatNote = (n: number) => n.toFixed(1).replace(".", ",");
