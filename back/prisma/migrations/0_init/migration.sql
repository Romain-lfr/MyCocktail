-- CreateEnum
CREATE TYPE "categorie_enum" AS ENUM ('alcool', 'jus', 'sirop', 'soda', 'eau', 'fruit', 'autre');

-- CreateEnum
CREATE TYPE "difficulte_enum" AS ENUM ('Facile', 'Moyen', 'Difficile');

-- CreateEnum
CREATE TYPE "motif_enum" AS ENUM ('contenu_inapproprie', 'spam', 'hors_sujet', 'violence', 'autre');

-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('user', 'moderateur', 'admin');

-- CreateEnum
CREATE TYPE "statut_enum" AS ENUM ('brouillon', 'publié', 'privé', 'archivé');

-- CreateEnum
CREATE TYPE "image_enum" AS ENUM ('profil', 'cocktail', 'avis', 'ingrédient', 'ustensile');

-- CreateTable
CREATE TABLE "_avis" (
    "idavis" VARCHAR(13) NOT NULL,
    "idcocktail" VARCHAR(13) NOT NULL,
    "idcompte" VARCHAR(13) NOT NULL,
    "noteavis" INTEGER NOT NULL,
    "titreavis" VARCHAR(100) NOT NULL,
    "descriptionavis" TEXT NOT NULL,
    "dateavis" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_avis_pkey" PRIMARY KEY ("idavis")
);

-- CreateTable
CREATE TABLE "_cocktail" (
    "idcocktail" VARCHAR(13) NOT NULL,
    "nomcocktail" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulte" "difficulte_enum" NOT NULL DEFAULT 'Facile',
    "alcool" BOOLEAN NOT NULL DEFAULT false,
    "duree" INTEGER NOT NULL,
    "statut" "statut_enum" NOT NULL DEFAULT 'brouillon',
    "datecreation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idcompte" VARCHAR(13) NOT NULL,

    CONSTRAINT "_cocktail_pkey" PRIMARY KEY ("idcocktail")
);

-- CreateTable
CREATE TABLE "_compte" (
    "idcompte" VARCHAR(13) NOT NULL,
    "pseudo" VARCHAR(50) NOT NULL,
    "mailcompte" VARCHAR(100) NOT NULL,
    "numtel" VARCHAR(20),
    "mdpcompte" VARCHAR(255) NOT NULL,
    "datenaissance" DATE NOT NULL,
    "dateinscription" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "role_enum" NOT NULL DEFAULT 'user',

    CONSTRAINT "_compte_pkey" PRIMARY KEY ("idcompte")
);

-- CreateTable
CREATE TABLE "_dosage" (
    "idcocktail" VARCHAR(13) NOT NULL,
    "idingredient" VARCHAR(13) NOT NULL,
    "quantite" DECIMAL(6,2) NOT NULL,
    "unite" VARCHAR(20) NOT NULL,
    "idetape" VARCHAR(13),

    CONSTRAINT "pk_dosage" PRIMARY KEY ("idcocktail","idingredient")
);

-- CreateTable
CREATE TABLE "_etape" (
    "idetape" VARCHAR(13) NOT NULL,
    "idcocktail" VARCHAR(13) NOT NULL,
    "numeroetape" INTEGER NOT NULL,
    "descriptionetape" TEXT NOT NULL,

    CONSTRAINT "_etape_pkey" PRIMARY KEY ("idetape")
);

-- CreateTable
CREATE TABLE "_etape_ustensile" (
    "idetape" VARCHAR(13) NOT NULL,
    "idustensile" VARCHAR(13) NOT NULL,

    CONSTRAINT "pk_etape_ustensile" PRIMARY KEY ("idetape","idustensile")
);

-- CreateTable
CREATE TABLE "_favori" (
    "idcompte" VARCHAR(13) NOT NULL,
    "idcocktail" VARCHAR(13) NOT NULL,
    "datefavori" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_favori" PRIMARY KEY ("idcompte","idcocktail")
);

-- CreateTable
CREATE TABLE "_frigo" (
    "idfrigo" VARCHAR(13) NOT NULL,
    "idcompte" VARCHAR(13) NOT NULL,

    CONSTRAINT "_frigo_pkey" PRIMARY KEY ("idfrigo")
);

-- CreateTable
CREATE TABLE "_frigo_composition" (
    "idfrigo" VARCHAR(13) NOT NULL,
    "idingredient" VARCHAR(13) NOT NULL,
    "quantite" DECIMAL(8,2) NOT NULL,
    "unite" VARCHAR(20) NOT NULL,

    CONSTRAINT "pk_frigo_composition" PRIMARY KEY ("idfrigo","idingredient")
);

-- CreateTable
CREATE TABLE "_image" (
    "idimage" VARCHAR(13) NOT NULL,
    "urlimage" VARCHAR(500) NOT NULL,
    "titleimage" VARCHAR(150) NOT NULL,
    "typeimage" "image_enum" NOT NULL,
    "idcocktail" VARCHAR(13),
    "idcompte" VARCHAR(13),
    "idavis" VARCHAR(13),
    "idingredient" VARCHAR(13),
    "idustensile" VARCHAR(13),

    CONSTRAINT "_image_pkey" PRIMARY KEY ("idimage")
);

-- CreateTable
CREATE TABLE "_ingredient" (
    "idingredient" VARCHAR(13) NOT NULL,
    "nomingredient" VARCHAR(100) NOT NULL,
    "categorie" "categorie_enum" NOT NULL DEFAULT 'autre',

    CONSTRAINT "_ingredient_pkey" PRIMARY KEY ("idingredient")
);

-- CreateTable
CREATE TABLE "_reponse" (
    "idreponse" VARCHAR(13) NOT NULL,
    "idavis" VARCHAR(13) NOT NULL,
    "idcompte" VARCHAR(13) NOT NULL,
    "idreponseparent" VARCHAR(13),
    "commentaire" TEXT NOT NULL,
    "datereponse" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_reponse_pkey" PRIMARY KEY ("idreponse")
);

-- CreateTable
CREATE TABLE "_signalement" (
    "idsignalement" VARCHAR(13) NOT NULL,
    "idcompte" VARCHAR(13) NOT NULL,
    "idcocktail" VARCHAR(13),
    "idavis" VARCHAR(13),
    "idcomptecible" VARCHAR(13),
    "motif" "motif_enum" NOT NULL,
    "datesignalement" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_signalement_pkey" PRIMARY KEY ("idsignalement")
);

-- CreateTable
CREATE TABLE "_ustensile" (
    "idustensile" VARCHAR(13) NOT NULL,
    "nomustensile" VARCHAR(100) NOT NULL,

    CONSTRAINT "_ustensile_pkey" PRIMARY KEY ("idustensile")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_avis_unique" ON "_avis"("idcocktail", "idcompte");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cocktail_nom_auteur" ON "_cocktail"("nomcocktail", "idcompte");

-- CreateIndex
CREATE UNIQUE INDEX "_compte_pseudo_key" ON "_compte"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "_compte_mailcompte_key" ON "_compte"("mailcompte");

-- CreateIndex
CREATE UNIQUE INDEX "uq_etape_ordre" ON "_etape"("idcocktail", "numeroetape");

-- CreateIndex
CREATE UNIQUE INDEX "_frigo_idcompte_key" ON "_frigo"("idcompte");

-- CreateIndex
CREATE UNIQUE INDEX "_image_urlimage_key" ON "_image"("urlimage");

-- CreateIndex
CREATE UNIQUE INDEX "_ingredient_nomingredient_key" ON "_ingredient"("nomingredient");

-- CreateIndex
CREATE UNIQUE INDEX "uq_signalement" ON "_signalement"("idcompte", "idcocktail", "idavis", "idcomptecible");

-- CreateIndex
CREATE UNIQUE INDEX "_ustensile_nomustensile_key" ON "_ustensile"("nomustensile");

-- AddForeignKey
ALTER TABLE "_avis" ADD CONSTRAINT "fk_avis_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_avis" ADD CONSTRAINT "fk_avis_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_cocktail" ADD CONSTRAINT "fk_cocktail_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_dosage" ADD CONSTRAINT "fk_dosage_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_dosage" ADD CONSTRAINT "fk_dosage_etape" FOREIGN KEY ("idetape") REFERENCES "_etape"("idetape") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_dosage" ADD CONSTRAINT "fk_dosage_ingredient" FOREIGN KEY ("idingredient") REFERENCES "_ingredient"("idingredient") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_etape" ADD CONSTRAINT "fk_etape_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_etape_ustensile" ADD CONSTRAINT "fk_eu_etape" FOREIGN KEY ("idetape") REFERENCES "_etape"("idetape") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_etape_ustensile" ADD CONSTRAINT "fk_eu_ustensile" FOREIGN KEY ("idustensile") REFERENCES "_ustensile"("idustensile") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_favori" ADD CONSTRAINT "fk_favori_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_favori" ADD CONSTRAINT "fk_favori_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_frigo" ADD CONSTRAINT "fk_frigo_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_frigo_composition" ADD CONSTRAINT "fk_fc_frigo" FOREIGN KEY ("idfrigo") REFERENCES "_frigo"("idfrigo") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_frigo_composition" ADD CONSTRAINT "fk_fc_ingredient" FOREIGN KEY ("idingredient") REFERENCES "_ingredient"("idingredient") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_image" ADD CONSTRAINT "fk_image_avis" FOREIGN KEY ("idavis") REFERENCES "_avis"("idavis") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_image" ADD CONSTRAINT "fk_image_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_image" ADD CONSTRAINT "fk_image_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_image" ADD CONSTRAINT "fk_image_ingredient" FOREIGN KEY ("idingredient") REFERENCES "_ingredient"("idingredient") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_image" ADD CONSTRAINT "fk_image_ustensile" FOREIGN KEY ("idustensile") REFERENCES "_ustensile"("idustensile") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_reponse" ADD CONSTRAINT "fk_reponse_avis" FOREIGN KEY ("idavis") REFERENCES "_avis"("idavis") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_reponse" ADD CONSTRAINT "fk_reponse_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_signalement" ADD CONSTRAINT "fk_sig_avis" FOREIGN KEY ("idavis") REFERENCES "_avis"("idavis") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_signalement" ADD CONSTRAINT "fk_sig_cocktail" FOREIGN KEY ("idcocktail") REFERENCES "_cocktail"("idcocktail") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_signalement" ADD CONSTRAINT "fk_sig_compte" FOREIGN KEY ("idcompte") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_signalement" ADD CONSTRAINT "fk_sig_compte_cible" FOREIGN KEY ("idcomptecible") REFERENCES "_compte"("idcompte") ON DELETE CASCADE ON UPDATE NO ACTION;

