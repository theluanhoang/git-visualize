import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Admin E2E', () => {
  let app: INestApplication;
  let server: any;
  let dataSource: DataSource;

  const email = `admin_${Date.now()}@example.com`;
  const password = 'P@ssw0rd!';
  let adminAccess: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('promotes user to admin and can access admin endpoints', async () => {
    await request(server).post('/auth/register').send({ email, password }).expect(201);

    // promote role in DB
    await dataSource.query('UPDATE "user" SET role = $1 WHERE email = $2', ['admin', email]);

    const loginRes = await request(server)
      .post('/auth/login')
      .set('user-agent', 'jest')
      .send({ email, password })
      .expect(200);
    adminAccess = loginRes.body.accessToken;

    const res = await request(server)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .expect(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
  });

  it('non-admin is forbidden', async () => {
    const u = `user_${Date.now()}@example.com`;
    await request(server).post('/auth/register').send({ email: u, password }).expect(201);
    const loginRes = await request(server)
      .post('/auth/login')
      .set('user-agent', 'jest')
      .send({ email: u, password })
      .expect(200);
    const token = loginRes.body.accessToken;

    await request(server)
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});


