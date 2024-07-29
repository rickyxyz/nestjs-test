import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as crypto from 'crypto';

// This test may fail if the create user or delete user API fails
// It is designed this way, so it will not be affected by other test

describe('AuthController (e2e)', () => {
  let app;
  let userId: string;
  let accessToken: string;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    username = `user_${crypto.randomBytes(8).toString('hex')}`;
    password = `pass_${crypto.randomBytes(8).toString('hex')}`;

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ username, password })
      .expect(201);

    userId = createUserResponse.body._id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    accessToken = loginResponse.body.access_token;
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterEach(async () => {
    if (userId) {
      try {
        await request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      } catch (error) {
        console.error('Error cleaning up user:', error);
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
