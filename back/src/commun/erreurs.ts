// Lecture sûre des erreurs attrapées (le type d'une erreur attrapée est `unknown`).

/** Message d'une Error (« Non autorisé », « Cocktail introuvable »…), chaîne vide sinon. */
export function messageErreur(e: unknown): string {
  return e instanceof Error ? e.message : '';
}

/** Message renvoyé par PostgreSQL via Prisma ($queryRaw) : `e.meta.message`, chaîne vide sinon. */
export function messageSql(e: unknown): string {
  const message = (e as { meta?: { message?: unknown } } | null)?.meta?.message;
  return typeof message === 'string' ? message : '';
}

/** Code d'erreur Prisma (ex. P2002 = contrainte d'unicité), undefined sinon. */
export function codePrisma(e: unknown): string | undefined {
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}
