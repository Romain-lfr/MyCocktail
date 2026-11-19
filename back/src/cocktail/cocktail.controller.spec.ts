import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DifficulteEnum } from './dto/create-cocktail.dto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  CocktailController,
  filtreImage,
  nomFichierUpload,
  TAILLE_MAX_IMAGE,
} from './cocktail.controller';
import { CocktailService } from './cocktail.service';
import { ImageService } from '../image/image.service';

describe('CocktailController', () => {
  let controller: CocktailController;
  const cocktailService = {
    findAll: jest.fn(),
    verifierAuteur: jest.fn(),
    create: jest.fn(),
    findByNom: jest.fn(),
    getIngredients: jest.fn(),
    getUstensiles: jest.fn(),
    addEtape: jest.fn(),
    addDosage: jest.fn(),
    addUstensile: jest.fn(),
    modifier: jest.fn(),
    supprimer: jest.fn(),
    modifierEtape: jest.fn(),
    supprimerEtape: jest.fn(),
    modifierDosage: jest.fn(),
    supprimerUstensileEtape: jest.fn(),
    supprimerDosage: jest.fn(),
    ajouterIngredient: jest.fn(),
    ajouterUstensile: jest.fn(),
  };
  const imageService = { ajouterImageCocktail: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailController],
      providers: [
        { provide: CocktailService, useValue: cocktailService },
        { provide: ImageService, useValue: imageService },
      ],
    }).compile();

    controller = module.get(CocktailController);
  });

  describe('findAll', () => {
    // 1er argument de findAll = filtre alcool (false = sans alcool, undefined = tout)
    const filtreAlcool = () => cocktailService.findAll.mock.calls[0][0];

    it('force les mocktails pour un visiteur non connecté, même avec ?alcool=true', () => {
      controller.findAll('true', undefined, undefined, undefined, {
        user: null,
      });
      expect(filtreAlcool()).toBe(false);
    });

    it('force les mocktails pour un mineur, même avec ?alcool=true', () => {
      controller.findAll('true', undefined, undefined, undefined, {
        user: {
          idcompte: 'CPT-00002',
          pseudo: 'romain',
          role: 'user',
          estMineur: true,
        },
      });
      expect(filtreAlcool()).toBe(false);
    });

    it('applique ?alcool=true pour un majeur', () => {
      controller.findAll('true', undefined, undefined, undefined, {
        user: {
          idcompte: 'CPT-00002',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        },
      });
      expect(filtreAlcool()).toBe(true);
    });

    it('applique ?alcool=false pour un majeur', () => {
      controller.findAll('false', undefined, undefined, undefined, {
        user: {
          idcompte: 'CPT-00002',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        },
      });
      expect(filtreAlcool()).toBe(false);
    });

    it('montre tout à un majeur sans filtre', () => {
      controller.findAll(undefined, undefined, undefined, undefined, {
        user: {
          idcompte: 'CPT-00002',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        },
      });
      expect(filtreAlcool()).toBeUndefined();
    });

    it('découpe les listes d’ingrédients et d’ustensiles', () => {
      controller.findAll(undefined, 'moj', 'ING-00001,ING-00002', 'UST-00001', {
        user: {
          idcompte: 'CPT-00002',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        },
      });
      expect(cocktailService.findAll).toHaveBeenCalledWith(
        undefined,
        'moj',
        ['ING-00001', 'ING-00002'],
        ['UST-00001'],
      );
    });
  });

  describe('uploadImage', () => {
    const req = {
      user: {
        idcompte: 'CPT-00001',
        pseudo: 'romain',
        role: 'user',
        estMineur: false,
      },
    };
    const fichier = {
      path: 'public/images/test.png',
      originalname: 'test.png',
    } as Express.Multer.File;

    it('renvoie 400 si aucun fichier n’est envoyé', async () => {
      await expect(
        controller.uploadImage('COK-00001', undefined as any, req),
      ).rejects.toThrow(BadRequestException);
    });

    it('supprime le fichier envoyé si on n’est pas l’auteur', async () => {
      // vrai fichier temporaire, comme celui que multer écrit sur le disque
      const dossier = fs.mkdtempSync(
        path.join(os.tmpdir(), 'mycocktail-test-'),
      );
      const chemin = path.join(dossier, 'upload.png');
      fs.writeFileSync(chemin, 'image');
      cocktailService.verifierAuteur.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.uploadImage('COK-00001', { ...fichier, path: chemin }, req),
      ).rejects.toThrow(ForbiddenException);

      expect(fs.existsSync(chemin)).toBe(false);
      expect(imageService.ajouterImageCocktail).not.toHaveBeenCalled();
      fs.rmSync(dossier, { recursive: true, force: true });
    });

    it('enregistre l’image si on est l’auteur', async () => {
      cocktailService.verifierAuteur.mockResolvedValue({});
      await controller.uploadImage('COK-00001', fichier, req);
      expect(imageService.ajouterImageCocktail).toHaveBeenCalledWith(
        'COK-00001',
        fichier.path,
        'test.png',
      );
    });
  });

  // ------------------------------------------------------------------
  const req = {
    user: {
      idcompte: 'CPT-00001',
      pseudo: 'romain',
      role: 'user',
      estMineur: false,
    },
  };
  const donnees = {
    nomcocktail: 'Mojito',
    description: 'Un classique cubain bien frais',
    difficulte: DifficulteEnum.Facile,
    alcool: true,
    duree: 5,
  };

  describe('routes simples (délégation au service avec le compte du token)', () => {
    it('create', () => {
      controller.create(donnees, req);
      expect(cocktailService.create).toHaveBeenCalledWith(
        donnees,
        'CPT-00001',
        false,
      );
    });

    it('findOne transmet le nom et l’utilisateur (ou null)', () => {
      controller.findOne('Mojito', { user: null });
      expect(cocktailService.findByNom).toHaveBeenCalledWith('Mojito', null);
    });

    it('getIngredients / getUstensiles', () => {
      controller.getIngredients();
      controller.getUstensiles();
      expect(cocktailService.getIngredients).toHaveBeenCalled();
      expect(cocktailService.getUstensiles).toHaveBeenCalled();
    });

    it('addEtape', () => {
      controller.addEtape(
        'COK-00001',
        { descriptionetape: 'Piler la menthe' },
        req,
      );
      expect(cocktailService.addEtape).toHaveBeenCalledWith(
        'COK-00001',
        { descriptionetape: 'Piler la menthe' },
        'CPT-00001',
      );
    });

    it('addDosage', () => {
      const dosage = {
        idingredient: 'ING-00001',
        quantite: 2,
        unite: 'cl',
        idetape: 'ETP-00001',
      };
      controller.addDosage('COK-00001', dosage, req);
      expect(cocktailService.addDosage).toHaveBeenCalledWith(
        'COK-00001',
        dosage,
        'CPT-00001',
      );
    });

    it('addUstensile', () => {
      const corps = { idetape: 'ETP-00001', idustensile: 'UST-00001' };
      controller.addUstensile(corps, req);
      expect(cocktailService.addUstensile).toHaveBeenCalledWith(
        corps,
        'CPT-00001',
      );
    });

    it('modifierDosage', () => {
      controller.modifierDosage(
        'COK-00001',
        'ING-00001',
        { quantite: 3, unite: 'cl' },
        req,
      );
      expect(cocktailService.modifierDosage).toHaveBeenCalledWith(
        'COK-00001',
        'ING-00001',
        3,
        'cl',
        'CPT-00001',
      );
    });

    it('supprimerDosage transmet l’id du compte connecté, jamais un id du client', () => {
      controller.supprimerDosage('COK-00001', 'ING-00001', req);
      expect(cocktailService.supprimerDosage).toHaveBeenCalledWith(
        'COK-00001',
        'ING-00001',
        'CPT-00001',
      );
    });

    it('supprimerUstensileEtape', () => {
      controller.supprimerUstensileEtape('ETP-00001', 'UST-00001', req);
      expect(cocktailService.supprimerUstensileEtape).toHaveBeenCalledWith(
        'ETP-00001',
        'UST-00001',
        'CPT-00001',
      );
    });

    it('ajouterIngredient / ajouterUstensile', () => {
      controller.ajouterIngredient({
        nomingredient: 'Menthe',
        categorie: 'autre',
      });
      controller.ajouterUstensile({ nomustensile: 'Pilon' });
      expect(cocktailService.ajouterIngredient).toHaveBeenCalledWith(
        'Menthe',
        'autre',
      );
      expect(cocktailService.ajouterUstensile).toHaveBeenCalledWith('Pilon');
    });
  });

  // Ces routes traduisent les erreurs du service en codes HTTP
  const routesAvecErreurs = [
    {
      nom: 'modifier',
      service: cocktailService.modifier,
      appel: () => controller.modifier('COK-00001', donnees, req),
      introuvable: 'Cocktail introuvable',
    },
    {
      nom: 'supprimer',
      service: cocktailService.supprimer,
      appel: () => controller.supprimer('COK-00001', req),
      introuvable: 'Cocktail introuvable',
    },
    {
      nom: 'modifierEtape',
      service: cocktailService.modifierEtape,
      appel: () =>
        controller.modifierEtape(
          'ETP-00001',
          { descriptionetape: 'Nouvelle étape' },
          req,
        ),
      introuvable: 'Etape introuvable',
    },
    {
      nom: 'supprimerEtape',
      service: cocktailService.supprimerEtape,
      appel: () => controller.supprimerEtape('ETP-00001', req),
      introuvable: 'Etape introuvable',
    },
  ];

  describe.each(routesAvecErreurs)(
    '$nom',
    ({ service, appel, introuvable }) => {
      it('renvoie le résultat du service', async () => {
        service.mockResolvedValue({ ok: true });
        await expect(appel()).resolves.toEqual({ ok: true });
      });

      it('traduit « Non autorisé » en 403', async () => {
        service.mockRejectedValue(new Error('Non autorisé'));
        await expect(appel()).rejects.toThrow(ForbiddenException);
      });

      it(`traduit « ${introuvable} » en 404`, async () => {
        service.mockRejectedValue(new Error(introuvable));
        await expect(appel()).rejects.toThrow(NotFoundException);
      });

      it('laisse passer les autres erreurs', async () => {
        service.mockRejectedValue(new Error('panne'));
        await expect(appel()).rejects.toThrow('panne');
      });
    },
  );

  describe('configuration de l’upload (multer)', () => {
    const fichierDe = (mimetype: string, originalname = 'photo.png') =>
      ({ mimetype, originalname }) as Express.Multer.File;

    it.each(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])(
      'accepte %s',
      (mimetype) => {
        const cb = jest.fn();
        filtreImage(null, fichierDe(mimetype), cb);
        expect(cb).toHaveBeenCalledWith(null, true);
      },
    );

    it.each(['image/gif', 'application/pdf', 'text/html'])(
      'refuse %s avec une erreur 400',
      (mimetype) => {
        const cb = jest.fn();
        filtreImage(null, fichierDe(mimetype), cb);
        expect(cb.mock.calls[0][0]).toBeInstanceOf(BadRequestException);
        expect(cb.mock.calls[0][1]).toBe(false);
      },
    );

    it('nomme le fichier avec l’horodatage et garde l’extension', () => {
      const cb = jest.fn();
      nomFichierUpload(null, fichierDe('image/png', 'mon cocktail.png'), cb);
      expect(cb.mock.calls[0][1]).toMatch(/^\d+\.png$/);
    });

    it('limite la taille à 5 Mo', () => {
      expect(TAILLE_MAX_IMAGE).toBe(5 * 1024 * 1024);
    });
  });
});
