# Ticketflow API

Ticketflow API is a Node.js/TypeScript backend for a ticket management system.

It includes authentication, authorization, ticket CRUD, assignment, status transitions, ticket comments, status history, Prisma migrations, seed data, automated tests, and API documentation.

The project follows a simple layered architecture and is designed to demonstrate how new backend features can be added to an existing codebase.

## Architecture

The application follows a simple layered architecture:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Prisma
  ↓
PostgreSQL
```

Business logic lives in services. Controllers stay thin. Repositories isolate Prisma data access.

## Tech Stack

- Node.js 22+
- TypeScript with strict mode
- Express
- Prisma ORM
- PostgreSQL 16
- Zod
- JWT authentication
- bcrypt password hashing
- Vitest
- Supertest
- ESLint
- Prettier
- Docker and Docker Compose

## Prerequisites

- Node.js 22+
- npm
- Docker
- Docker Compose

## Setup

Clone the repository and install dependencies:

```bash
git clone <repo>

cd ticketflow-api

npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Run Prisma migrations:

```bash
npm run db:migrate
```

Seed the database:

```bash
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

### Database Setup Helper

Alternatively, use the included helper to prepare the database:

```bash
npm run setup:db
```

This prepares the Prisma client, runs migrations, and seeds the database.

## Husky

This repository uses Husky and lint-staged to run Prettier and ESLint on commits.

Husky is installed automatically during `npm install` because the project includes a `prepare` script.

If hooks need to be initialized manually:

```bash
npm run prepare
```

## Running the API

The API starts on:

```text
http://localhost:3000
```

Swagger documentation is available at:

```text
http://localhost:3000/api/docs
```

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://ticket_user:ticket_password@localhost:5432/ticket_management"

JWT_SECRET="change-me-in-development"
JWT_EXPIRES_IN="1h"
```

For tests, a separate database can be configured with:

```env
TEST_DATABASE_URL="postgresql://ticket_user:ticket_password@localhost:5432/ticket_management_test"
```

## Test Credentials

The seed creates these development accounts:

| Email               | Password    | Role  |
| ------------------- | ----------- | ----- |
| `admin@example.com` | `Admin123!` | ADMIN |
| `agent@example.com` | `Agent123!` | AGENT |
| `user1@example.com` | `User123!`  | USER  |
| `user2@example.com` | `User234!`  | USER  |

These credentials are for local development and testing only.

## API Endpoints

All ticket endpoints require authentication.

### Health

```text
GET /health
```

Checks that the API and database are available.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET /api/users
```

### Tickets

```text
POST   /api/tickets
GET    /api/tickets?page=1&limit=20
GET    /api/tickets/:id
PATCH  /api/tickets/:id
DELETE /api/tickets/:id
PATCH  /api/tickets/:id/status
PATCH  /api/tickets/:id/assign
```

### Comments

```text
POST /api/tickets/:id/comments
GET  /api/tickets/:id/comments
```

Comments are linked to both the ticket and the user who created them.

### Status History

```text
GET /api/tickets/:id/status-history
```

Returns the status changes recorded for a ticket.

When a ticket status is successfully changed using:

```text
PATCH /api/tickets/:id/status
```

a status history record is automatically created.

## Usage Example

Login to receive a JWT:

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"User123!"}' \
  | jq -r '.data.token'
```

Save the token:

```bash
TOKEN="<paste-token-here>"
```

Use the token for protected endpoints:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users
```

The server expects the `Authorization` header in the following format:

```text
Authorization: Bearer <token>
```

## Ticket Examples

### Create a Ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unable to reset password",
    "description": "The password reset link is not working.",
    "priority": "HIGH"
  }'
```

### Get a Ticket

```bash
curl http://localhost:3000/api/tickets/unable-to-reset-password \
  -H "Authorization: Bearer $TOKEN"
```

### Change Ticket Status

```bash
curl -X PATCH \
  http://localhost:3000/api/tickets/unable-to-reset-password/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
```

A successful status change also creates a status history record.

### Add a Comment

```bash
curl -X POST \
  http://localhost:3000/api/tickets/unable-to-reset-password/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body":"Customer provided additional information."}'
```

### Get Comments

```bash
curl \
  http://localhost:3000/api/tickets/unable-to-reset-password/comments \
  -H "Authorization: Bearer $TOKEN"
```

### Get Status History

```bash
curl \
  http://localhost:3000/api/tickets/unable-to-reset-password/status-history \
  -H "Authorization: Bearer $TOKEN"
```

Example response:

```json
{
  "data": [
    {
      "id": "history-id",
      "ticketId": "unable-to-reset-password",
      "fromStatus": "OPEN",
      "toStatus": "IN_PROGRESS",
      "changedById": "user-id",
      "createdAt": "2026-09-24T10:00:00.000Z"
    }
  ]
}
```

## Authorization Model

### ADMIN

- Can view all tickets.
- Can create tickets.
- Can update any ticket.
- Can assign tickets.
- Can change ticket status.
- Can delete tickets.
- Can access comments and status history for tickets they can view.

### AGENT

- Can view tickets according to the existing ticket permissions.
- Can create tickets.
- Can update tickets assigned to them.
- Can change status of tickets assigned to them.
- Can assign tickets according to the existing authorization rules.
- Can access comments and status history for tickets they can view.

### USER

- Can create tickets.
- Can view tickets they created.
- Can update their own open tickets.
- Cannot change ticket status.
- Can create and view comments on tickets they can access.
- Can view status history for tickets they can access.

The existing ticket authorization rules are reused for comments and status history.

## Status Transitions

The API supports the following status transitions:

```text
OPEN
 ├── IN_PROGRESS
 └── CLOSED

IN_PROGRESS
 ├── RESOLVED
 └── OPEN

RESOLVED
 ├── CLOSED
 └── IN_PROGRESS

CLOSED
 └── OPEN
```

Invalid status transitions return a validation error.

## Database

Prisma schema:

```text
prisma/schema.prisma
```

The main ticket-related models are:

- `User`
- `Ticket`
- `Comment`
- `StatusHistory`

`Comment` stores comments made on tickets.

`StatusHistory` stores every successful ticket status change, including the previous status, new status, user who made the change, and creation time.

Useful database commands:

```bash
npm run db:migrate
npm run db:seed
npm run db:reset
npm run db:studio
```

The Prisma migrations are stored in:

```text
prisma/migrations/
```

## Testing

Run the full test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Test coverage:

```bash
npm run test:coverage
```

The test suite contains unit and integration tests.

Integration tests use a separate PostgreSQL database named:

```text
ticket_management_test
```

This prevents the development database from being reset during testing.

If you want to override the test database connection:

```bash
TEST_DATABASE_URL="postgresql://ticket_user:ticket_password@localhost:5432/ticket_management_test" npm test
```

Before running tests, make sure PostgreSQL is running:

```bash
docker compose up -d
```

## Project Structure

```text
src/
  app.ts
  server.ts

  config/

  middleware/

  db/

  modules/
    auth/
    users/
    tickets/

  types/
  utils/

prisma/
  schema.prisma
  migrations/
  seed.ts

tests/
  helpers/
  unit/
  integration/

docs/

docker/
```

The ticket module contains the ticket, comment, and status history layers:

```text
src/modules/tickets/

  ticket.controller.ts
  ticket.service.ts
  ticket.repository.ts
  ticket.routes.ts
  ticket.schemas.ts

  comment.controller.ts
  comment.service.ts
  comment.repository.ts

  status-history.controller.ts
  status-history.service.ts
  status-history.repository.ts
```

## Useful Commands

Install dependencies:

```bash
npm install
```

Start PostgreSQL:

```bash
docker compose up -d
```

Run migrations:

```bash
npm run db:migrate
```

Seed the database:

```bash
npm run db:seed
```

Start development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

## Day 15 Feature Work

The Day 15 feature work adds:

- Ticket comments.
- Comment creation and listing endpoints.
- Ticket status history.
- Status history endpoint.
- Automatic status history creation when a ticket status changes.
- Authorization checks for comments and status history.
- Integration tests for the new functionality.
- Impact analysis documentation.

Related documentation:

```text
docs/day-15-ticket.md
docs/impact-analysis-template.md
```
