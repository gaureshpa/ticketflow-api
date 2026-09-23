import type { Request, Response } from 'express';
import type { AuthenticatedRequest, AuthUser } from '../../types/auth';
import type { CreateCommentInput } from './ticket.schemas';
import { CommentService } from './comment.service';

const commentService = new CommentService();

function authUser(request: Request): AuthUser {
  return (request as AuthenticatedRequest).user!;
}

export class CommentController {
  async create(request: Request, response: Response) {
    const comment = await commentService.createComment(
      authUser(request),
      String(request.params.id),
      (request.body as CreateCommentInput).body
    );

    response.status(201).json({ data: comment });
  }

  async list(request: Request, response: Response) {
    const comments = await commentService.listComments(
      authUser(request),
      String(request.params.id)
    );

    response.json({ data: comments });
  }
}

export const commentController = new CommentController();
