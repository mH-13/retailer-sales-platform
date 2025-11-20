import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockRegion = {
    id: 1,
    name: 'Dhaka',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            region: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllRegions', () => {
    it('should return all regions', async () => {
      const regions = [mockRegion];
      jest.spyOn(prisma.region, 'findMany').mockResolvedValue(regions);

      const result = await service.findAllRegions();

      expect(result).toEqual(regions);
      expect(prisma.region.findMany).toHaveBeenCalled();
    });
  });

  describe('findOneRegion', () => {
    it('should return a region when found', async () => {
      jest.spyOn(prisma.region, 'findUnique').mockResolvedValue(mockRegion);

      const result = await service.findOneRegion(1);

      expect(result).toEqual(mockRegion);
    });

    it('should throw NotFoundException when region not found', async () => {
      jest.spyOn(prisma.region, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneRegion(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createRegion', () => {
    it('should create a new region', async () => {
      const createDto = { name: 'Dhaka' };

      // No existing region
      jest.spyOn(prisma.region, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.region, 'create').mockResolvedValue(mockRegion);

      const result = await service.createRegion(createDto);

      expect(result).toEqual(mockRegion);
      expect(prisma.region.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw ConflictException when region name already exists', async () => {
      const createDto = { name: 'Dhaka' };

      // Region already exists
      jest.spyOn(prisma.region, 'findFirst').mockResolvedValue(mockRegion);

      await expect(service.createRegion(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
