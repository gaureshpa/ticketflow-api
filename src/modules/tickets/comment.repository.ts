import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

const commentInclude = {
  author: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  }
} satisfies Prisma.CommentInclude;

export class CommentRepository {
  async create(data: Prisma.CommentUncheckedCreateInput) {
    return prisma.comment.create({
      data,
      include: commentInclude
    });
  }

  async findMany(ticketId: string) {
    return prisma.comment.findMany({
      where: { ticketId },
      include: commentInclude,
      orderBy: { createdAt: 'asc' }
    });
  }
}
