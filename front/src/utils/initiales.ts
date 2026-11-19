// Initiales d'un pseudo pour l'avatar par défaut (1 ou 2 lettres, en majuscules).
//   « romain » → « R », « jean_dupont » → « JD », « Marie Claire » → « MC »,
//   « RomainLfr » → « RL », « » → « ? ».

const premiere = (mot: string) => Array.from(mot)[0]; // mot jamais vide (filtré)

export function initiales(pseudo: string | null | undefined): string {
  const mots = (pseudo ?? "").trim().split(/[\s_.-]+/).filter(Boolean);
  if (mots.length === 0) return "?";

  if (mots.length >= 2) return (premiere(mots[0]) + premiere(mots[1])).toUpperCase();

  // Un seul mot : on coupe sur une majuscule interne (camelCase)
  const parties = mots[0].split(/(?<=\p{Ll})(?=\p{Lu})/u);
  if (parties.length >= 2) return (premiere(parties[0]) + premiere(parties[1])).toUpperCase();

  return premiere(mots[0]).toUpperCase();
}
