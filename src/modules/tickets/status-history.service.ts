import type { AuthUser } from '../../types/auth';
import { TicketService } from './ticket.service';
import { StatusHistoryRepository } from './status-history.repository';

const repository = new StatusHistoryRepository();
const ticketService = new TicketService();

export class StatusHistoryService {
  async listHistory(currentUser: AuthUser, ticketId: string) {
    await ticketService.getTicketById(currentUser, ticketId);

    return repository.findMany(ticketId);
  }
}
