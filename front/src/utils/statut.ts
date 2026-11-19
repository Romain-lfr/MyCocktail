// Libellé lisible d'un statut de cocktail.
// Prisma renvoie les valeurs d'enum sans accent (publi_, priv_, archiv_).
const STATUTS: Record<string, string> = {
  brouillon: "Brouillon",
  publi_: "Publié", "publié": "Publié",
  priv_: "Privé", "privé": "Privé",
  archiv_: "Archivé", "archivé": "Archivé",
};

export const libelleStatut = (s: string) => STATUTS[s] ?? s;
