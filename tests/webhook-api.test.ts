process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createHmac } from 'crypto';

// Ajuste a URL base conforme necessário para ambiente local/teste
const BASE_URL = 'https://localhost:3000';
const WEBHOOK_PATH = '/api/bling/webhooks';
const WEBHOOK_SECRET = process.env.BLING_WEBHOOK_SECRET || 'test_secret';

describe('Bling Webhook API', () => {
  it('deve rejeitar payload com assinatura inválida', async () => {
    const payload = JSON.stringify({ event: 'test.event', eventId: 'evt-1', data: {} });
    const res = await request(BASE_URL)
      .post(WEBHOOK_PATH)
      .set('x-bling-signature-256', 'sha256=assinatura_invalida')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('deve aceitar payload com assinatura válida', async () => {
    const payload = JSON.stringify({ event: 'test.event', eventId: 'evt-2', data: {} });
    const signature =
      'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(payload, 'utf8').digest('hex');
    const res = await request(BASE_URL)
      .post(WEBHOOK_PATH)
      .set('x-bling-signature-256', signature)
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve ignorar eventId duplicado (idempotência)', async () => {
    const payload = JSON.stringify({ event: 'test.event', eventId: 'evt-3', data: {} });
    const signature =
      'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(payload, 'utf8').digest('hex');
    // Primeira chamada
    await request(BASE_URL)
      .post(WEBHOOK_PATH)
      .set('x-bling-signature-256', signature)
      .send(payload);
    // Segunda chamada duplicada
    const res = await request(BASE_URL)
      .post(WEBHOOK_PATH)
      .set('x-bling-signature-256', signature)
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.duplicate).toBe(true);
  });
});
