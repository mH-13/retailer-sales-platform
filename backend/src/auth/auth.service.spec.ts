import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Mock user data matching the actual schema
  const mockUser = {
    id: 1,
    username: 'test_user',
    passwordHash: '$2b$10$hashedPassword',
    name: 'Test User',
    phone: '01711111111',
    role: 'SR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            salesRep: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and user when credentials are valid', async () => {
      const bcrypt = require('bcrypt');
      const mockToken = 'mock.jwt.token';

      // Mock successful database lookup
      jest.spyOn(prisma.salesRep, 'findUnique').mockResolvedValue(mockUser);
      // Mock successful password comparison
      bcrypt.compare.mockResolvedValue(true);
      // Mock JWT token generation
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await service.login({
        username: 'test_user',
        password: 'password123',
      });

      // Should return token and user data
      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('username', 'test_user');
      // Password should not be in response (security)
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Mock user not found
      jest.spyOn(prisma.salesRep, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const bcrypt = require('bcrypt');

      // User exists but password is wrong
      jest.spyOn(prisma.salesRep, 'findUnique').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({ username: 'test_user', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
