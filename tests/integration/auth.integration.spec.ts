import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api } from '../helpers/test-app.js';
import {
  disconnectTestDatabase,
  resetTestDatabase
} from '../helpers/test-db.js';

async function login(email: string, password: string) {
  const response = await api.post('/api/auth/login').send({ email, password });
  return response.body.data.token as string;
}

describe('authentication API', () => {
  let user1Token: string;

  beforeAll(async () => {
    await resetTestDatabase();

    user1Token = await login('user1@example.com', 'User123!');
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('registers a new user successfully', async () => {
    const response = await api.post('/api/auth/register').send({
      email: 'new.user@example.com',
      password: 'NewUser123!',
      name: 'New User'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('new.user@example.com');
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it('rejects duplicate email registration', async () => {
    const response = await api.post('/api/auth/register').send({
      email: 'admin@example.com',
      password: 'Admin123!',
      name: 'Duplicate Admin'
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('logs in successfully', async () => {
    const response = await api.post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('ADMIN');
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it('rejects invalid password', async () => {
    const response = await api.post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'wrong-password'
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects protected endpoint without token', async () => {
    const response = await api.get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('prevents a user from creating a comment on another users ticket', async () => {
    const response = await api
      .post('/api/tickets/payment-failed-during-checkout/comments')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        body: 'I should not be able to comment on this ticket.'
      });

    expect(response.status).toBe(403);
  });

  it('prevents a user from viewing status history of another users ticket', async () => {
    const response = await api
      .get('/api/tickets/payment-failed-during-checkout/status-history')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
