import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Git Engine E2E', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /git/execute executes git init', async () => {
    const res = await request(server)
      .post('/git/execute')
      .send({ command: 'git init' });
    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('output');
  });
});


