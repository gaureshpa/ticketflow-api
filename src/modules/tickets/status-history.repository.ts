import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';

const statusHistoryInclude = {
  changedBy: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  }
} satisfies Prisma.StatusHistoryInclude;

export class StatusHistoryRepository {
  async create(data: Prisma.StatusHistoryUncheckedCreateInput) {
    return prisma.statusHistory.create({
      data,
      include: statusHistoryInclude
    });
  }

  async findMany(ticketId: string) {
    return prisma.statusHistory.findMany({
      where: {
        ticketId
      },
      include: statusHistoryInclude,
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
}
