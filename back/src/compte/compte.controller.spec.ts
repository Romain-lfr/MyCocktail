import { Test, TestingModule } from '@nestjs/testing';
import { CompteController } from './compte.controller';
import { CompteService } from './compte.service';

describe('CompteController', () => {
  let controller: CompteController;
  const compteService = {
    getMonCompte: jest.fn(),
    getMesCocktails: jest.fn(),
    getMesFavoris: jest.fn(),
    getMesAvis: jest.fn(),
    isFavori: jest.fn(),
    ajouterFavori: jest.fn(),
    supprimerFavori: jest.fn(),
    rechercherComptes: jest.fn(),
    modifierCompte: jest.fn(),
    getMonFrigo: jest.fn(),
    ajouterIngredientFrigo: jest.fn(),
    supprimerIngredientFrigo: jest.fn(),
    getCocktailsRealisables: jest.fn(),
  };
  const req = { user: { idcompte: 'CPT-00001', estMineur: true } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CompteService, useValue: compteService }],
      controllers: [CompteController],
    }).compile();

    controller = module.get(CompteController);
  });

  // Toutes les routes « moi » doivent utiliser le compte du token, jamais un id venant du client
  it.each([
    ['getMonCompte', 'getMonCompte'],
    ['getMesCocktails', 'getMesCocktails'],
    ['getMesFavoris', 'getMesFavoris'],
    ['getMesAvis', 'getMesAvis'],
    ['getMonFrigo', 'getMonFrigo'],
  ] as const)('%s utilise le compte du token', (route, methode) => {
    (controller[route] as (r: unknown) => unknown)(req);
    expect(compteService[methode]).toHaveBeenCalledWith('CPT-00001');
  });

  it('favoris : vérifier, ajouter, supprimer', () => {
    controller.isFavori('COK-00001', req);
    controller.ajouterFavori('COK-00001', req);
    controller.supprimerFavori('COK-00001', req);
    expect(compteService.isFavori).toHaveBeenCalledWith('CPT-00001', 'COK-00001');
    expect(compteService.ajouterFavori).toHaveBeenCalledWith('CPT-00001', 'COK-00001');
    expect(compteService.supprimerFavori).toHaveBeenCalledWith('CPT-00001', 'COK-00001');
  });

  it('rechercherComptes transmet le pseudo cherché', () => {
    controller.rechercherComptes('rom');
    expect(compteService.rechercherComptes).toHaveBeenCalledWith('rom');
  });

  it('modifierCompte transmet le corps validé', () => {
    controller.modifierCompte({ pseudo: 'nouveau' }, req);
    expect(compteService.modifierCompte).toHaveBeenCalledWith('CPT-00001', { pseudo: 'nouveau' });
  });

  it('frigo : ajouter et retirer un ingrédient', () => {
    controller.ajouterIngredientFrigo('ING-00001', { quantite: 50, unite: 'cl' }, req);
    controller.supprimerIngredientFrigo('ING-00001', req);
    expect(compteService.ajouterIngredientFrigo).toHaveBeenCalledWith('CPT-00001', 'ING-00001', 50, 'cl');
    expect(compteService.supprimerIngredientFrigo).toHaveBeenCalledWith('CPT-00001', 'ING-00001');
  });

  it('getCocktailsRealisables transmet aussi estMineur', () => {
    controller.getCocktailsRealisables(req);
    expect(compteService.getCocktailsRealisables).toHaveBeenCalledWith('CPT-00001', true);
  });
});
