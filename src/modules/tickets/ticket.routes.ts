import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { ticketController } from './ticket.controller.js';
import {
  assignTicketSchema,
  changeTicketStatusSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema
} from './ticket.schemas.js';
import { commentController } from './comment.controller.js';
import { createCommentSchema } from './ticket.schemas.js';
import { statusHistoryController } from './status-history.controller.js';

export const ticketRoutes = Router();

ticketRoutes.use(requireAuth);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     summary: Create a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Ticket created
 *   get:
 *     summary: List tickets with pagination
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated ticket list
 */
ticketRoutes.post(
  '/',
  validate({ body: createTicketSchema }),
  (req, res, next) => {
    ticketController.create(req, res).catch(next);
  }
);

ticketRoutes.get(
  '/',
  validate({ query: listTicketsQuerySchema }),
  (req, res, next) => {
    ticketController.list(req, res).catch(next);
  }
);

/**
 * @openapi
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a ticket by id
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket found
 *   patch:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket updated
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket deleted
 */
ticketRoutes.get(
  '/:id',
  validate({ params: ticketIdParamSchema }),
  (req, res, next) => {
    ticketController.getById(req, res).catch(next);
  }
);

ticketRoutes.patch(
  '/:id',
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  (req, res, next) => {
    ticketController.update(req, res).catch(next);
  }
);

ticketRoutes.delete(
  '/:id',
  validate({ params: ticketIdParamSchema }),
  (req, res, next) => {
    ticketController.delete(req, res).catch(next);
  }
);

/**
 * @openapi
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Change ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
ticketRoutes.patch(
  '/:id/status',
  validate({ params: ticketIdParamSchema, body: changeTicketStatusSchema }),
  (req, res, next) => {
    ticketController.changeStatus(req, res).catch(next);
  }
);

/**
 * @openapi
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign a ticket to an admin or agent
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignment updated
 */
ticketRoutes.patch(
  '/:id/assign',
  validate({ params: ticketIdParamSchema, body: assignTicketSchema }),
  (req, res, next) => {
    ticketController.assign(req, res).catch(next);
  }
);

ticketRoutes.post(
  '/:id/comments',
  validate({
    params: ticketIdParamSchema,
    body: createCommentSchema
  }),
  (req, res, next) => {
    commentController.create(req, res).catch(next);
  }
);

ticketRoutes.get(
  '/:id/comments',
  validate({
    params: ticketIdParamSchema
  }),
  (req, res, next) => {
    commentController.list(req, res).catch(next);
  }
);

ticketRoutes.get(
  '/:id/status-history',
  validate({
    params: ticketIdParamSchema
  }),
  (req, res, next) => {
    statusHistoryController.list(req, res).catch(next);
  }
);
