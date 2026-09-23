import type { AuthUser } from '../../types/auth.js';
import { BadRequestError } from '../../utils/errors';
import { TicketService } from './ticket.service';
import { CommentRepository } from './comment.repository.js';

const repository = new CommentRepository();
const ticketService = new TicketService();

export class CommentService {
  async createComment(currentUser: AuthUser, ticketId: string, body: string) {
    const ticket = await ticketService.getTicketById(currentUser, ticketId);

    if (!body.trim()) {
      throw new BadRequestError(
        `INVALID_COMMENT`,
        'Comment body cannot be empty'
      );
    }

    return repository.create({
      ticketId: ticket.id,
      authorId: currentUser.userId,
      body: body.trim()
    });
  }

  async listComments(currentUser: AuthUser, ticketId: string) {
    await ticketService.getTicketById(currentUser, ticketId);

    return repository.findMany(ticketId);
  }
}
