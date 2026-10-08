import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the service as unavailable when the database query fails', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: () => Promise.reject(new Error('connection refused')),
          },
        },
      ],
    }).compile();

    await expect(
      moduleRef.get(HealthController).check(),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
