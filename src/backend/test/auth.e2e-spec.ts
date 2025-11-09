import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;
  let server: any;
  const email = `e2e_${Date.now()}@example.com`;
  const password = 'P@ssw0rd!';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register creates user', async () => {
    const res = await request(server).post('/auth/register').send({ email, password }).expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', email);
  });

  it('POST /auth/login issues tokens', async () => {
    const res = await request(server)
      .post('/auth/login')
      .set('user-agent', 'jest')
      .send({ email, password })
      .expect(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
  });

  it('GET /auth/me returns current user', async () => {
    const res = await request(server).get('/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body).toHaveProperty('email', email);
  });
});


