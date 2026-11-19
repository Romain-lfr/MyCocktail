import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AvisController } from './avis.controller';
import { AvisService } from './avis.service';

describe('AvisController', () => {
  let controller: AvisController;
  const avisService = {
    ajouterAvis: jest.fn(),
    modifierAvis: jest.fn(),
    supprimerAvis: jest.fn(),
    ajouterReponse: jest.fn(),
    modifierReponse: jest.fn(),
    supprimerReponse: jest.fn(),
  };
  const req = {
    user: {
      idcompte: 'CPT-00001',
      pseudo: 'romain',
      role: 'user',
      estMineur: false,
    },
  };
  const avis = {
    noteavis: 5,
    titreavis: 'Top',
    descriptionavis: 'Vraiment excellent',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AvisService, useValue: avisService }],
      controllers: [AvisController],
    }).compile();

    controller = module.get(AvisController);
  });

  it('ajouterAvis utilise le compte du token', async () => {
    await controller.ajouterAvis('COK-00001', avis, req);
    expect(avisService.ajouterAvis).toHaveBeenCalledWith(
      'COK-00001',
      'CPT-00001',
      avis,
    );
  });

  it('ajouterReponse transmet le commentaire et la réponse parente', async () => {
    await controller.ajouterReponse(
      'AVS-00001',
      { commentaire: 'Merci', idreponse_parent: 'REP-00001' },
      req,
    );
    expect(avisService.ajouterReponse).toHaveBeenCalledWith(
      'AVS-00001',
      'CPT-00001',
      'Merci',
      'REP-00001',
    );
  });

  // Les 4 routes de modification/suppression traduisent les erreurs du service en codes HTTP
  const routes = [
    {
      nom: 'modifierAvis',
      service: avisService.modifierAvis,
      appel: () => controller.modifierAvis('AVS-00001', avis, req),
      introuvable: 'Avis introuvable',
    },
    {
      nom: 'supprimerAvis',
      service: avisService.supprimerAvis,
      appel: () => controller.supprimerAvis('AVS-00001', req),
      introuvable: 'Avis introuvable',
    },
    {
      nom: 'modifierReponse',
      service: avisService.modifierReponse,
      appel: () =>
        controller.modifierReponse('REP-00001', { commentaire: 'Edit' }, req),
      introuvable: 'Réponse introuvable',
    },
    {
      nom: 'supprimerReponse',
      service: avisService.supprimerReponse,
      appel: () => controller.supprimerReponse('REP-00001', req),
      introuvable: 'Réponse introuvable',
    },
  ];

  describe.each(routes)('$nom', ({ service, appel, introuvable }) => {
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
  });

  it('les appels de modification utilisent le compte du token', async () => {
    avisService.modifierReponse.mockResolvedValue({});
    await controller.modifierReponse('REP-00001', { commentaire: 'Edit' }, req);
    expect(avisService.modifierReponse).toHaveBeenCalledWith(
      'REP-00001',
      'CPT-00001',
      'Edit',
    );
  });
});
