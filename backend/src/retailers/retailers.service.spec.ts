import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RetailersService } from './retailers.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('RetailersService', () => {
  let service: RetailersService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockRetailer = {
    id: 1,
    uid: 'RET-001',
    name: 'Test Store',
    phone: '01711111111',
    regionId: 1,
    areaId: 1,
    distributorId: 1,
    territoryId: 1,
    points: 100,
    routes: 'Route A',
    notes: 'Good location',
    createdAt: new Date(),
    updatedAt: new Date(),
    region: { id: 1, name: 'Dhaka' },
    area: { id: 1, name: 'Gulshan' },
    distributor: { id: 1, name: 'ABC Dist' },
    territory: { id: 1, name: 'Block A' },
    assignments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetailersService,
        {
          provide: PrismaService,
          useValue: {
            retailer: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RetailersService>(RetailersService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a retailer when found (Admin)', async () => {
      // Cache miss
      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.retailer, 'findUnique').mockResolvedValue(mockRetailer);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');

      const result = await service.findOne('RET-001', 1, 'ADMIN');

      expect(result).toEqual(mockRetailer);
    });

    it('should throw NotFoundException when retailer not found', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.retailer, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('RET-999', 1, 'ADMIN')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when SR tries to access unassigned retailer', async () => {
      // SR with userId=2, but retailer has no assignments
      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.retailer, 'findUnique').mockResolvedValue({
        ...mockRetailer,
        assignments: [], // No assignments
      });

      await expect(service.findOne('RET-001', 2, 'SR')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update retailer and invalidate cache', async () => {
      const updateDto = { points: 200 };
      const updatedRetailer = { ...mockRetailer, points: 200 };

      // Mock findOne (verifies access)
      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.retailer, 'findUnique').mockResolvedValue(mockRetailer);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');

      // Mock update
      jest.spyOn(prisma.retailer, 'update').mockResolvedValue(updatedRetailer);
      jest.spyOn(redis, 'del').mockResolvedValue(1);
      jest.spyOn(redis, 'delPattern').mockResolvedValue(5);

      const result = await service.update('RET-001', 1, 'ADMIN', updateDto);

      expect(result.points).toBe(200);
      expect(redis.del).toHaveBeenCalled(); // Cache invalidated
    });
  });
});
