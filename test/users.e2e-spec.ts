import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.userTokenBalance.deleteMany(),
      prisma.token.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  const createUserAndToken = async () => {
    const user = await prisma.user.create({
      data: {
        walletAddress: '0xuser000000000000000000000000000000000001',
        username: 'tester',
        tier: 'Dust',
        trustScore: 123,
      },
    });
    const token = await jwtService.signAsync({ userId: user.id, walletAddress: user.walletAddress });
    return { user, token };
  };

  it('GET /users/me returns profile', async () => {
    const { token, user } = await createUserAndToken();

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.id).toBe(user.id);
    expect(response.body.walletAddress).toBe(user.walletAddress);
  });

  it('PATCH /users/me updates username & avatar', async () => {
    const { token } = await createUserAndToken();

    const payload = { username: 'newname', avatar: 'https://avatar.example/test.png' };
    const response = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(response.body.username).toBe('newname');
    expect(response.body.avatar).toBe('https://avatar.example/test.png');
  });

  it('GET /users/search/people returns paginated list', async () => {
    const { user, token } = await createUserAndToken();
    await prisma.user.create({
      data: {
        walletAddress: '0xuser000000000000000000000000000000000002',
        username: 'designer',
        jobTitle: 'UI/UX Designer',
        jobType: 'Contract',
        tier: 'Spark',
        trustScore: 400,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/search/people')
      .query({ keyword: 'Designer' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].username).toBe('designer');
  });

  it('POST /users/:id/follow toggles follow state', async () => {
    const { user, token } = await createUserAndToken();
    const target = await prisma.user.create({
      data: {
        walletAddress: '0xuserfollow',
        username: 'followme',
        tier: 'Dust',
        trustScore: 200,
      },
    });

    await request(app.getHttpServer())
      .post(`/api/v1/users/${target.id}/follow`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const followEntry = await prisma.follow.findFirst({ where: { followerId: user.id, followingId: target.id } });
    expect(followEntry).toBeTruthy();

    await request(app.getHttpServer())
      .delete(`/api/v1/users/${target.id}/follow`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await prisma.follow.findFirst({ where: { followerId: user.id, followingId: target.id } });
    expect(deleted).toBeNull();
  });
});
