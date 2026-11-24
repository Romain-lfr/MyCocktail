import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: jest.fn(), register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
      controllers: [AuthController],
    }).compile();

    controller = module.get(AuthController);
  });

  it('login transmet pseudo/email et mot de passe au service', async () => {
    authService.login.mockResolvedValue({
      access_token: 't',
      estMineur: false,
    });
    await expect(
      controller.login({ pseudoOrMail: 'romain', mdp: 'Romain1234' }),
    ).resolves.toEqual({
      access_token: 't',
      estMineur: false,
    });
    expect(authService.login).toHaveBeenCalledWith('romain', 'Romain1234');
  });

  it('register transmet les champs du formulaire au service', async () => {
    await controller.register({
      pseudo: 'nouveau',
      mail: 'n@myxo.com',
      mdp: 'MotDePasse123',
      dateNaissance: '2000-01-01',
    });
    expect(authService.register).toHaveBeenCalledWith(
      'nouveau',
      'n@myxo.com',
      'MotDePasse123',
      '2000-01-01',
    );
  });
});
