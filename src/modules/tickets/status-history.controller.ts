import type { Request, Response } from 'express';
import type { AuthenticatedRequest, AuthUser } from '../../types/auth';
import { StatusHistoryService } from './status-history.service';

const statusHistoryService = new StatusHistoryService();

function authUser(request: Request): AuthUser {
  return (request as AuthenticatedRequest).user!;
}

export class StatusHistoryController {
  async list(request: Request, response: Response) {
    const history = await statusHistoryService.listHistory(
      authUser(request),
      String(request.params.id)
    );

    response.json({ data: history });
  }
}

export const statusHistoryController = new StatusHistoryController();
