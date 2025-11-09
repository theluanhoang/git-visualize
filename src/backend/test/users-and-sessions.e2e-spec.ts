import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users & Sessions E2E', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;
  const email = `u_${Date.now()}@example.com`;
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

  it('GET /users/me returns profile', async () => {
    const res = await request(server).get('/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body).toHaveProperty('email', email);
  });

  it('PUT /users/me updates profile', async () => {
    const res = await request(server)
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'John' })
      .expect(200);
    expect(res.body).toHaveProperty('firstName', 'John');
  });

  it('GET /auth/sessions/device-info returns info', async () => {
    const res = await request(server)
      .get('/auth/sessions/device-info')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('User-Agent', 'jest-e2e')
      .expect(200);
    expect(res.body).toHaveProperty('userAgent');
  });
});


