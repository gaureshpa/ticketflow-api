# Impact Analysis

## Existing Request Flow

The ticket API follows this flow:

Route → Controller → Service → Repository → Prisma → Database

Authentication happens before the ticket routes are reached.

The new comment and status history features follow the same flow.

## Database Impact

We use two database models:

### Comment

Stores comments made on tickets.

It contains

- Ticket ID
- Author ID
- Comment body
- Created time
- Updated time

### StatusHistory

Stores every status change made to a ticket

It contains:

- Ticket ID
- Previous status
- New status
- User who changed the status
- Created time

Both models are connected to the existing `Ticket` and `User` models.

## API Impact

We added three endpoints

### Create comment

`POST /api/tickets/:id/comments`  
Creates a new comment on a ticket

### List comments

`GET /api/tickets/:id/comments`

Returns the comments for a ticket.

### List status history

`GET /api/tickets/:id/status-history`

Returns the status changes for a ticket.

We also updated the existing endpoint:

`PATCH /api/tickets/:id/status`

When a status is successfully changed, a status history record is created.

## Service Impact

### CommentService

Responsible for:

- Creating comments.
- Listing comments.
- Checking that the user can access the ticket.

### StatusHistoryService

Responsible for:

- Getting status history.
- Checking that the user can access the ticket.

### TicketService

The existing `changeStatus()` method was updated to create a status history record after changing the ticket status.

## Repository/Data Access Impact

We added:

### CommentRepository

Handles:

- Creating comments.
- Getting comments for a ticket.

### StatusHistoryRepository

Handles:

- Creating status history records.
- Getting status history for a ticket.

Both use Prisma to access PostgreSQL.

## Authorization Impact

No new roles or permissions were added.

We reuse the existing ticket permissions.

- ADMIN can access any ticket
- AGENT can access tickets they are allowed to access.
- USER can only acces their own tickets

The same permissions apply when accessing comments and status history.

For status changes:

- ADMIN can change status.
- Assigned AGENT can change status.
- USER cannot change status.

## Testing Impact

Integration tests were added for:

- Creating a comment.
- Listing comments.
- Preventing users from commenting on another user's ticket.
- Preventing users from viewing another user's status history.
- Creating and retrieving status history after a status change.

## Migration Plan

A Prisma migration was created for the new database changes.

The migration adds the required database structure for:

- Comments.
- Status history.
- Their relationships with tickets and users.
- Required indexes.

The migration should be applied using the normal Prisma migration commands.

## Risks

- Users could access another user's comments or status history if authorization is incorrect.
- A status change could happen without creating its history record.
- Existing status transition rules could accidentally be changed.
- Database migration problems could prevent the application from starting correctly.
- Tests that modify the same ticket could affect each other if the test database is not reset.

## Out of Scope

This change does not include:

- Editing comments.
- Deleting comments.
- Editing or deleting status history.
- Status history pagination.
- New user roles.
- Changing existing status transition rules.
- Notifications.
- Frontend changes.
