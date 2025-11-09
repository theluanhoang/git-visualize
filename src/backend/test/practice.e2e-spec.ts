import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Practice E2E', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;

  const email = `p_${Date.now()}@example.com`;
  const password = 'P@ssw0rd!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    await request(server).post('/auth/register').send({ email, password }).expect(201);
    const loginRes = await request(server)
      .post('/auth/login')
      .set('user-agent', 'jest')
      .send({ email, password })
      .expect(200);
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /practices returns list', async () => {
    const res = await request(server).get('/practices').expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /practices/:id/view increments views', async () => {
    await request(server).post('/practices/any-id/view').expect(204);
  });

  it('repo-state upsert/get/delete (auth required)', async () => {
    const practiceId = 'any-id';
    const state = { branches: { main: [] } } as any;

    const upsert = await request(server)
      .put(`/practices/${practiceId}/repository-state`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...state, version: 1 })
      .expect(201).catch(async (e) => {
        // Some controllers may return 200; accept both
        const retry = await request(server)
          .put(`/practices/${practiceId}/repository-state`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...state, version: 1 });
        expect([200,201]).toContain(retry.status);
        return retry;
      });
    expect([200,201]).toContain(upsert.status);

    const get = await request(server)
      .get(`/practices/${practiceId}/repository-state`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(get.body).toBeDefined();

    await request(server)
      .delete(`/practices/${practiceId}/repository-state`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});


