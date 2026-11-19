// Unités proposées selon la catégorie d'un ingrédient ; la première est l'unité par défaut.
export function unitesPourCategorie(categorie?: string): string[] {
  switch (categorie) {
    case "fruit": return ["pièce", "tranche", "g"];
    case "autre": return ["morceau", "feuille", "pincée", "g"];
    default: return ["cl", "ml", "l"]; // alcool, jus, sirop, soda, eau, inconnue
  }
}
