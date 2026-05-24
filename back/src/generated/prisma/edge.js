
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/zyfleur/Documents/MyCocktail/mycocktail/back/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/zyfleur/Documents/MyCocktail/mycocktail/back/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel avis {\n  idavis          String        @id @db.VarChar(13)\n  idcocktail      String        @db.VarChar(13)\n  idcompte        String        @db.VarChar(13)\n  noteavis        Int\n  titreavis       String        @db.VarChar(100)\n  descriptionavis String\n  dateavis        DateTime      @default(now()) @db.Timestamptz(6)\n  cocktail        cocktail      @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_avis_cocktail\")\n  compte          compte        @relation(fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_avis_compte\")\n  image_avis      image_avis[]\n  reponse         reponse[]\n  signalement     signalement[]\n\n  @@unique([idcocktail, idcompte], map: \"uq_avis_unique\")\n  @@map(\"_avis\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel cocktail {\n  idcocktail     String           @id @db.VarChar(13)\n  nomcocktail    String           @db.VarChar(100)\n  description    String\n  difficulte     difficulte_enum  @default(Facile)\n  alcool         Boolean          @default(false)\n  duree          Int\n  statut         statut_enum      @default(brouillon)\n  datecreation   DateTime         @default(now()) @db.Timestamptz(6)\n  idcompte       String           @db.VarChar(13)\n  avis           avis[]\n  compte         compte           @relation(fields: [idcompte], references: [idcompte], onDelete: NoAction, onUpdate: NoAction, map: \"fk_cocktail_compte\")\n  dosage         dosage[]\n  etape          etape[]\n  favori         favori[]\n  image_cocktail image_cocktail[]\n  signalement    signalement[]\n\n  @@unique([nomcocktail, idcompte], map: \"uq_cocktail_nom_auteur\")\n  @@map(\"_cocktail\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel compte {\n  idcompte                                      String        @id @db.VarChar(13)\n  pseudo                                        String        @unique @db.VarChar(50)\n  mailcompte                                    String        @unique @db.VarChar(100)\n  numtel                                        String?       @db.VarChar(20)\n  mdpcompte                                     String        @db.VarChar(255)\n  datenaissance                                 DateTime      @db.Date\n  dateinscription                               DateTime      @default(now()) @db.Timestamptz(6)\n  role                                          role_enum     @default(user)\n  avis                                          avis[]\n  cocktail                                      cocktail[]\n  favori                                        favori[]\n  frigo                                         frigo?\n  image_compte                                  image_compte?\n  reponse                                       reponse[]\n  signalement_signalement_idcompteTocompte      signalement[] @relation(\"signalement_idcompteTocompte\")\n  signalement_signalement_idcomptecibleTocompte signalement[] @relation(\"signalement_idcomptecibleTocompte\")\n\n  @@map(\"_compte\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel dosage {\n  idcocktail   String     @db.VarChar(13)\n  idingredient String     @db.VarChar(13)\n  quantite     Decimal    @db.Decimal(6, 2)\n  unite        String     @db.VarChar(20)\n  idetape      String?    @db.VarChar(13)\n  cocktail     cocktail   @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_dosage_cocktail\")\n  etape        etape?     @relation(fields: [idetape], references: [idetape], onUpdate: NoAction, map: \"fk_dosage_etape\")\n  ingredient   ingredient @relation(fields: [idingredient], references: [idingredient], onDelete: NoAction, onUpdate: NoAction, map: \"fk_dosage_ingredient\")\n\n  @@id([idcocktail, idingredient], map: \"pk_dosage\")\n  @@map(\"_dosage\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel etape {\n  idetape          String            @id @db.VarChar(13)\n  idcocktail       String            @db.VarChar(13)\n  numeroetape      Int\n  descriptionetape String\n  dosage           dosage[]\n  cocktail         cocktail          @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_etape_cocktail\")\n  etape_ustensile  etape_ustensile[]\n\n  @@unique([idcocktail, numeroetape], map: \"uq_etape_ordre\")\n  @@map(\"_etape\")\n}\n\nmodel etape_ustensile {\n  idetape     String    @db.VarChar(13)\n  idustensile String    @db.VarChar(13)\n  etape       etape     @relation(fields: [idetape], references: [idetape], onDelete: Cascade, onUpdate: NoAction, map: \"fk_eu_etape\")\n  ustensile   ustensile @relation(fields: [idustensile], references: [idustensile], onUpdate: NoAction, map: \"fk_eu_ustensile\")\n\n  @@id([idetape, idustensile], map: \"pk_etape_ustensile\")\n  @@map(\"_etape_ustensile\")\n}\n\nmodel favori {\n  idcompte   String   @db.VarChar(13)\n  idcocktail String   @db.VarChar(13)\n  datefavori DateTime @default(now()) @db.Timestamptz(6)\n  cocktail   cocktail @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_favori_cocktail\")\n  compte     compte   @relation(fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_favori_compte\")\n\n  @@id([idcompte, idcocktail], map: \"pk_favori\")\n  @@map(\"_favori\")\n}\n\nmodel frigo {\n  idfrigo           String              @id @db.VarChar(13)\n  idcompte          String              @unique @db.VarChar(13)\n  compte            compte              @relation(fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_frigo_compte\")\n  frigo_composition frigo_composition[]\n\n  @@map(\"_frigo\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel frigo_composition {\n  idfrigo      String     @db.VarChar(13)\n  idingredient String     @db.VarChar(13)\n  quantite     Decimal    @db.Decimal(8, 2)\n  unite        String     @db.VarChar(20)\n  frigo        frigo      @relation(fields: [idfrigo], references: [idfrigo], onDelete: Cascade, onUpdate: NoAction, map: \"fk_fc_frigo\")\n  ingredient   ingredient @relation(fields: [idingredient], references: [idingredient], onDelete: Cascade, onUpdate: NoAction, map: \"fk_fc_ingredient\")\n\n  @@id([idfrigo, idingredient], map: \"pk_frigo_composition\")\n  @@map(\"_frigo_composition\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel image {\n  idimage          String             @id @db.VarChar(13)\n  urlimage         String             @unique @db.VarChar(500)\n  titleimage       String             @db.VarChar(150)\n  image_avis       image_avis[]\n  image_cocktail   image_cocktail[]\n  image_compte     image_compte[]\n  image_ingredient image_ingredient[]\n  image_ustensile  image_ustensile[]\n\n  @@map(\"_image\")\n}\n\nmodel image_avis {\n  idimage String @db.VarChar(13)\n  idavis  String @db.VarChar(13)\n  avis    avis   @relation(fields: [idavis], references: [idavis], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ia_avis\")\n  image   image  @relation(fields: [idimage], references: [idimage], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ia_image\")\n\n  @@id([idimage, idavis], map: \"pk_image_avis\")\n  @@map(\"_image_avis\")\n}\n\nmodel image_cocktail {\n  idimage    String   @db.VarChar(13)\n  idcocktail String   @db.VarChar(13)\n  cocktail   cocktail @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ic_cocktail\")\n  image      image    @relation(fields: [idimage], references: [idimage], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ic_image\")\n\n  @@id([idimage, idcocktail], map: \"pk_image_cocktail\")\n  @@map(\"_image_cocktail\")\n}\n\nmodel image_compte {\n  idimage  String @db.VarChar(13)\n  idcompte String @unique @db.VarChar(13)\n  compte   compte @relation(fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_icp_compte\")\n  image    image  @relation(fields: [idimage], references: [idimage], onDelete: Cascade, onUpdate: NoAction, map: \"fk_icp_image\")\n\n  @@id([idimage, idcompte], map: \"pk_image_compte\")\n  @@map(\"_image_compte\")\n}\n\nmodel image_ingredient {\n  idimage      String     @db.VarChar(13)\n  idingredient String     @unique @db.VarChar(13)\n  image        image      @relation(fields: [idimage], references: [idimage], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ii_image\")\n  ingredient   ingredient @relation(fields: [idingredient], references: [idingredient], onDelete: Cascade, onUpdate: NoAction, map: \"fk_ii_ingredient\")\n\n  @@id([idimage, idingredient], map: \"pk_image_ingredient\")\n  @@map(\"_image_ingredient\")\n}\n\nmodel image_ustensile {\n  idimage     String    @db.VarChar(13)\n  idustensile String    @unique @db.VarChar(13)\n  image       image     @relation(fields: [idimage], references: [idimage], onDelete: Cascade, onUpdate: NoAction, map: \"fk_iu_image\")\n  ustensile   ustensile @relation(fields: [idustensile], references: [idustensile], onDelete: Cascade, onUpdate: NoAction, map: \"fk_iu_ustensile\")\n\n  @@id([idimage, idustensile], map: \"pk_image_ustensile\")\n  @@map(\"_image_ustensile\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel ingredient {\n  idingredient      String              @id @db.VarChar(13)\n  nomingredient     String              @unique @db.VarChar(100)\n  categorie         categorie_enum      @default(autre)\n  dosage            dosage[]\n  frigo_composition frigo_composition[]\n  image_ingredient  image_ingredient?\n\n  @@map(\"_ingredient\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel reponse {\n  idreponse   String   @id @db.VarChar(13)\n  idavis      String   @db.VarChar(13)\n  idcompte    String   @db.VarChar(13)\n  commentaire String\n  datereponse DateTime @default(now()) @db.Timestamptz(6)\n  avis        avis     @relation(fields: [idavis], references: [idavis], onDelete: Cascade, onUpdate: NoAction, map: \"fk_reponse_avis\")\n  compte      compte   @relation(fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_reponse_compte\")\n\n  @@unique([idavis, idcompte], map: \"uq_reponse_unique\")\n  @@map(\"_reponse\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel signalement {\n  idsignalement                            String     @id @db.VarChar(13)\n  idcompte                                 String     @db.VarChar(13)\n  idcocktail                               String?    @db.VarChar(13)\n  idavis                                   String?    @db.VarChar(13)\n  idcomptecible                            String?    @db.VarChar(13)\n  motif                                    motif_enum\n  datesignalement                          DateTime   @default(now()) @db.Timestamptz(6)\n  avis                                     avis?      @relation(fields: [idavis], references: [idavis], onDelete: Cascade, onUpdate: NoAction, map: \"fk_sig_avis\")\n  cocktail                                 cocktail?  @relation(fields: [idcocktail], references: [idcocktail], onDelete: Cascade, onUpdate: NoAction, map: \"fk_sig_cocktail\")\n  compte_signalement_idcompteTocompte      compte     @relation(\"signalement_idcompteTocompte\", fields: [idcompte], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_sig_compte\")\n  compte_signalement_idcomptecibleTocompte compte?    @relation(\"signalement_idcomptecibleTocompte\", fields: [idcomptecible], references: [idcompte], onDelete: Cascade, onUpdate: NoAction, map: \"fk_sig_compte_cible\")\n\n  @@unique([idcompte, idcocktail, idavis, idcomptecible], map: \"uq_signalement\")\n  @@map(\"_signalement\")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel ustensile {\n  idustensile     String            @id @db.VarChar(13)\n  nomustensile    String            @unique @db.VarChar(100)\n  etape_ustensile etape_ustensile[]\n  image_ustensile image_ustensile?\n\n  @@map(\"_ustensile\")\n}\n\nenum categorie_enum {\n  alcool\n  jus\n  sirop\n  soda\n  eau\n  fruit\n  autre\n}\n\nenum difficulte_enum {\n  Facile\n  Moyen\n  Difficile\n}\n\nenum motif_enum {\n  contenu_inapproprie\n  spam\n  hors_sujet\n  violence\n  autre\n}\n\nenum role_enum {\n  user\n  moderateur\n  admin\n}\n\nenum statut_enum {\n  brouillon\n  publi_    @map(\"publié\")\n  priv_     @map(\"privé\")\n  archiv_   @map(\"archivé\")\n}\n",
  "inlineSchemaHash": "7bed0d354fbe0151977cdfba5a75a2ebe59c854c9dc2d708315dfd3a1bf22cef",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"avis\":{\"dbName\":\"_avis\",\"fields\":[{\"name\":\"idavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"noteavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titreavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descriptionavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"avisTococktail\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"avisTocompte\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_avis\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_avis\",\"relationName\":\"avisToimage_avis\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reponse\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"reponse\",\"relationName\":\"avisToreponse\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signalement\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"signalement\",\"relationName\":\"avisTosignalement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"idcocktail\",\"idcompte\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"idcocktail\",\"idcompte\"]}],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"cocktail\":{\"dbName\":\"_cocktail\",\"fields\":[{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nomcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"difficulte\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"difficulte_enum\",\"default\":\"Facile\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alcool\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duree\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statut\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"statut_enum\",\"default\":\"brouillon\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"datecreation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avis\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"avis\",\"relationName\":\"avisTococktail\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"cocktailTocompte\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"NoAction\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dosage\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dosage\",\"relationName\":\"cocktailTodosage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etape\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"etape\",\"relationName\":\"cocktailToetape\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"favori\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"favori\",\"relationName\":\"cocktailTofavori\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_cocktail\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_cocktail\",\"relationName\":\"cocktailToimage_cocktail\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signalement\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"signalement\",\"relationName\":\"cocktailTosignalement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"nomcocktail\",\"idcompte\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"nomcocktail\",\"idcompte\"]}],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"compte\":{\"dbName\":\"_compte\",\"fields\":[{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pseudo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mailcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numtel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mdpcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"datenaissance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateinscription\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"role_enum\",\"default\":\"user\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avis\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"avis\",\"relationName\":\"avisTocompte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailTocompte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"favori\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"favori\",\"relationName\":\"compteTofavori\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frigo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"frigo\",\"relationName\":\"compteTofrigo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_compte\",\"relationName\":\"compteToimage_compte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reponse\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"reponse\",\"relationName\":\"compteToreponse\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signalement_signalement_idcompteTocompte\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"signalement\",\"relationName\":\"signalement_idcompteTocompte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signalement_signalement_idcomptecibleTocompte\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"signalement\",\"relationName\":\"signalement_idcomptecibleTocompte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"dosage\":{\"dbName\":\"_dosage\",\"fields\":[{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idingredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idetape\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailTodosage\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etape\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"etape\",\"relationName\":\"dosageToetape\",\"relationFromFields\":[\"idetape\"],\"relationToFields\":[\"idetape\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredient\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ingredient\",\"relationName\":\"dosageToingredient\",\"relationFromFields\":[\"idingredient\"],\"relationToFields\":[\"idingredient\"],\"relationOnDelete\":\"NoAction\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idcocktail\",\"idingredient\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"etape\":{\"dbName\":\"_etape\",\"fields\":[{\"name\":\"idetape\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numeroetape\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descriptionetape\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dosage\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dosage\",\"relationName\":\"dosageToetape\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailToetape\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etape_ustensile\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"etape_ustensile\",\"relationName\":\"etapeToetape_ustensile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"idcocktail\",\"numeroetape\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"idcocktail\",\"numeroetape\"]}],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"etape_ustensile\":{\"dbName\":\"_etape_ustensile\",\"fields\":[{\"name\":\"idetape\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idustensile\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etape\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"etape\",\"relationName\":\"etapeToetape_ustensile\",\"relationFromFields\":[\"idetape\"],\"relationToFields\":[\"idetape\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ustensile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ustensile\",\"relationName\":\"etape_ustensileToustensile\",\"relationFromFields\":[\"idustensile\"],\"relationToFields\":[\"idustensile\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idetape\",\"idustensile\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"favori\":{\"dbName\":\"_favori\",\"fields\":[{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"datefavori\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailTofavori\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"compteTofavori\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idcompte\",\"idcocktail\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"frigo\":{\"dbName\":\"_frigo\",\"fields\":[{\"name\":\"idfrigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"compteTofrigo\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frigo_composition\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"frigo_composition\",\"relationName\":\"frigoTofrigo_composition\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"frigo_composition\":{\"dbName\":\"_frigo_composition\",\"fields\":[{\"name\":\"idfrigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idingredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frigo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"frigo\",\"relationName\":\"frigoTofrigo_composition\",\"relationFromFields\":[\"idfrigo\"],\"relationToFields\":[\"idfrigo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredient\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ingredient\",\"relationName\":\"frigo_compositionToingredient\",\"relationFromFields\":[\"idingredient\"],\"relationToFields\":[\"idingredient\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idfrigo\",\"idingredient\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"image\":{\"dbName\":\"_image\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"urlimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titleimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_avis\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_avis\",\"relationName\":\"imageToimage_avis\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_cocktail\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_cocktail\",\"relationName\":\"imageToimage_cocktail\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_compte\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_compte\",\"relationName\":\"imageToimage_compte\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_ingredient\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_ingredient\",\"relationName\":\"imageToimage_ingredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_ustensile\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_ustensile\",\"relationName\":\"imageToimage_ustensile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"image_avis\":{\"dbName\":\"_image_avis\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avis\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"avis\",\"relationName\":\"avisToimage_avis\",\"relationFromFields\":[\"idavis\"],\"relationToFields\":[\"idavis\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image\",\"relationName\":\"imageToimage_avis\",\"relationFromFields\":[\"idimage\"],\"relationToFields\":[\"idimage\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idimage\",\"idavis\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"image_cocktail\":{\"dbName\":\"_image_cocktail\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailToimage_cocktail\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image\",\"relationName\":\"imageToimage_cocktail\",\"relationFromFields\":[\"idimage\"],\"relationToFields\":[\"idimage\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idimage\",\"idcocktail\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"image_compte\":{\"dbName\":\"_image_compte\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"compteToimage_compte\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image\",\"relationName\":\"imageToimage_compte\",\"relationFromFields\":[\"idimage\"],\"relationToFields\":[\"idimage\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idimage\",\"idcompte\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"image_ingredient\":{\"dbName\":\"_image_ingredient\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idingredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image\",\"relationName\":\"imageToimage_ingredient\",\"relationFromFields\":[\"idimage\"],\"relationToFields\":[\"idimage\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredient\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ingredient\",\"relationName\":\"image_ingredientToingredient\",\"relationFromFields\":[\"idingredient\"],\"relationToFields\":[\"idingredient\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idimage\",\"idingredient\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"image_ustensile\":{\"dbName\":\"_image_ustensile\",\"fields\":[{\"name\":\"idimage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idustensile\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image\",\"relationName\":\"imageToimage_ustensile\",\"relationFromFields\":[\"idimage\"],\"relationToFields\":[\"idimage\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ustensile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ustensile\",\"relationName\":\"image_ustensileToustensile\",\"relationFromFields\":[\"idustensile\"],\"relationToFields\":[\"idustensile\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"idimage\",\"idustensile\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ingredient\":{\"dbName\":\"_ingredient\",\"fields\":[{\"name\":\"idingredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nomingredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categorie\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"categorie_enum\",\"default\":\"autre\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dosage\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dosage\",\"relationName\":\"dosageToingredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frigo_composition\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"frigo_composition\",\"relationName\":\"frigo_compositionToingredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_ingredient\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_ingredient\",\"relationName\":\"image_ingredientToingredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"reponse\":{\"dbName\":\"_reponse\",\"fields\":[{\"name\":\"idreponse\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commentaire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"datereponse\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avis\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"avis\",\"relationName\":\"avisToreponse\",\"relationFromFields\":[\"idavis\"],\"relationToFields\":[\"idavis\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"compteToreponse\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"idavis\",\"idcompte\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"idavis\",\"idcompte\"]}],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"signalement\":{\"dbName\":\"_signalement\",\"fields\":[{\"name\":\"idsignalement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcompte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcocktail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idavis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idcomptecible\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"motif\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"motif_enum\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"datesignalement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avis\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"avis\",\"relationName\":\"avisTosignalement\",\"relationFromFields\":[\"idavis\"],\"relationToFields\":[\"idavis\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocktail\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"cocktail\",\"relationName\":\"cocktailTosignalement\",\"relationFromFields\":[\"idcocktail\"],\"relationToFields\":[\"idcocktail\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte_signalement_idcompteTocompte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"signalement_idcompteTocompte\",\"relationFromFields\":[\"idcompte\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compte_signalement_idcomptecibleTocompte\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"compte\",\"relationName\":\"signalement_idcomptecibleTocompte\",\"relationFromFields\":[\"idcomptecible\"],\"relationToFields\":[\"idcompte\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"idcompte\",\"idcocktail\",\"idavis\",\"idcomptecible\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"idcompte\",\"idcocktail\",\"idavis\",\"idcomptecible\"]}],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"},\"ustensile\":{\"dbName\":\"_ustensile\",\"fields\":[{\"name\":\"idustensile\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nomustensile\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etape_ustensile\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"etape_ustensile\",\"relationName\":\"etape_ustensileToustensile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image_ustensile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"image_ustensile\",\"relationName\":\"image_ustensileToustensile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\"}},\"enums\":{\"categorie_enum\":{\"values\":[{\"name\":\"alcool\",\"dbName\":null},{\"name\":\"jus\",\"dbName\":null},{\"name\":\"sirop\",\"dbName\":null},{\"name\":\"soda\",\"dbName\":null},{\"name\":\"eau\",\"dbName\":null},{\"name\":\"fruit\",\"dbName\":null},{\"name\":\"autre\",\"dbName\":null}],\"dbName\":null},\"difficulte_enum\":{\"values\":[{\"name\":\"Facile\",\"dbName\":null},{\"name\":\"Moyen\",\"dbName\":null},{\"name\":\"Difficile\",\"dbName\":null}],\"dbName\":null},\"motif_enum\":{\"values\":[{\"name\":\"contenu_inapproprie\",\"dbName\":null},{\"name\":\"spam\",\"dbName\":null},{\"name\":\"hors_sujet\",\"dbName\":null},{\"name\":\"violence\",\"dbName\":null},{\"name\":\"autre\",\"dbName\":null}],\"dbName\":null},\"role_enum\":{\"values\":[{\"name\":\"user\",\"dbName\":null},{\"name\":\"moderateur\",\"dbName\":null},{\"name\":\"admin\",\"dbName\":null}],\"dbName\":null},\"statut_enum\":{\"values\":[{\"name\":\"brouillon\",\"dbName\":null},{\"name\":\"publi_\",\"dbName\":\"publié\"},{\"name\":\"priv_\",\"dbName\":\"privé\"},{\"name\":\"archiv_\",\"dbName\":\"archivé\"}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

