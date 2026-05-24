
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AvisScalarFieldEnum = {
  idavis: 'idavis',
  idcocktail: 'idcocktail',
  idcompte: 'idcompte',
  noteavis: 'noteavis',
  titreavis: 'titreavis',
  descriptionavis: 'descriptionavis',
  dateavis: 'dateavis'
};

exports.Prisma.CocktailScalarFieldEnum = {
  idcocktail: 'idcocktail',
  nomcocktail: 'nomcocktail',
  description: 'description',
  difficulte: 'difficulte',
  alcool: 'alcool',
  duree: 'duree',
  statut: 'statut',
  datecreation: 'datecreation',
  idcompte: 'idcompte'
};

exports.Prisma.CompteScalarFieldEnum = {
  idcompte: 'idcompte',
  pseudo: 'pseudo',
  mailcompte: 'mailcompte',
  numtel: 'numtel',
  mdpcompte: 'mdpcompte',
  datenaissance: 'datenaissance',
  dateinscription: 'dateinscription',
  role: 'role'
};

exports.Prisma.DosageScalarFieldEnum = {
  idcocktail: 'idcocktail',
  idingredient: 'idingredient',
  quantite: 'quantite',
  unite: 'unite',
  idetape: 'idetape'
};

exports.Prisma.EtapeScalarFieldEnum = {
  idetape: 'idetape',
  idcocktail: 'idcocktail',
  numeroetape: 'numeroetape',
  descriptionetape: 'descriptionetape'
};

exports.Prisma.Etape_ustensileScalarFieldEnum = {
  idetape: 'idetape',
  idustensile: 'idustensile'
};

exports.Prisma.FavoriScalarFieldEnum = {
  idcompte: 'idcompte',
  idcocktail: 'idcocktail',
  datefavori: 'datefavori'
};

exports.Prisma.FrigoScalarFieldEnum = {
  idfrigo: 'idfrigo',
  idcompte: 'idcompte'
};

exports.Prisma.Frigo_compositionScalarFieldEnum = {
  idfrigo: 'idfrigo',
  idingredient: 'idingredient',
  quantite: 'quantite',
  unite: 'unite'
};

exports.Prisma.ImageScalarFieldEnum = {
  idimage: 'idimage',
  urlimage: 'urlimage',
  titleimage: 'titleimage'
};

exports.Prisma.Image_avisScalarFieldEnum = {
  idimage: 'idimage',
  idavis: 'idavis'
};

exports.Prisma.Image_cocktailScalarFieldEnum = {
  idimage: 'idimage',
  idcocktail: 'idcocktail'
};

exports.Prisma.Image_compteScalarFieldEnum = {
  idimage: 'idimage',
  idcompte: 'idcompte'
};

exports.Prisma.Image_ingredientScalarFieldEnum = {
  idimage: 'idimage',
  idingredient: 'idingredient'
};

exports.Prisma.Image_ustensileScalarFieldEnum = {
  idimage: 'idimage',
  idustensile: 'idustensile'
};

exports.Prisma.IngredientScalarFieldEnum = {
  idingredient: 'idingredient',
  nomingredient: 'nomingredient',
  categorie: 'categorie'
};

exports.Prisma.ReponseScalarFieldEnum = {
  idreponse: 'idreponse',
  idavis: 'idavis',
  idcompte: 'idcompte',
  commentaire: 'commentaire',
  datereponse: 'datereponse'
};

exports.Prisma.SignalementScalarFieldEnum = {
  idsignalement: 'idsignalement',
  idcompte: 'idcompte',
  idcocktail: 'idcocktail',
  idavis: 'idavis',
  idcomptecible: 'idcomptecible',
  motif: 'motif',
  datesignalement: 'datesignalement'
};

exports.Prisma.UstensileScalarFieldEnum = {
  idustensile: 'idustensile',
  nomustensile: 'nomustensile'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.difficulte_enum = exports.$Enums.difficulte_enum = {
  Facile: 'Facile',
  Moyen: 'Moyen',
  Difficile: 'Difficile'
};

exports.statut_enum = exports.$Enums.statut_enum = {
  brouillon: 'brouillon',
  publi_: 'publi_',
  priv_: 'priv_',
  archiv_: 'archiv_'
};

exports.role_enum = exports.$Enums.role_enum = {
  user: 'user',
  moderateur: 'moderateur',
  admin: 'admin'
};

exports.categorie_enum = exports.$Enums.categorie_enum = {
  alcool: 'alcool',
  jus: 'jus',
  sirop: 'sirop',
  soda: 'soda',
  eau: 'eau',
  fruit: 'fruit',
  autre: 'autre'
};

exports.motif_enum = exports.$Enums.motif_enum = {
  contenu_inapproprie: 'contenu_inapproprie',
  spam: 'spam',
  hors_sujet: 'hors_sujet',
  violence: 'violence',
  autre: 'autre'
};

exports.Prisma.ModelName = {
  avis: 'avis',
  cocktail: 'cocktail',
  compte: 'compte',
  dosage: 'dosage',
  etape: 'etape',
  etape_ustensile: 'etape_ustensile',
  favori: 'favori',
  frigo: 'frigo',
  frigo_composition: 'frigo_composition',
  image: 'image',
  image_avis: 'image_avis',
  image_cocktail: 'image_cocktail',
  image_compte: 'image_compte',
  image_ingredient: 'image_ingredient',
  image_ustensile: 'image_ustensile',
  ingredient: 'ingredient',
  reponse: 'reponse',
  signalement: 'signalement',
  ustensile: 'ustensile'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
