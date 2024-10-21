import request from 'supertest';

import app from '../src/index';  // エントリーポイント

import { resetDatabase, closeDatabase } from './setupDatabase';

const createdPlayerIds: number[] = [];

beforeAll(async () => {
  await resetDatabase(); // テスト開始前にデータベースを初期化

  const responseTaro = await request(app)
    .post('/api/player')
    .send({ name: 'Taro' });
  createdPlayerIds[0] = responseTaro.body.id;

  const responseHanako = await request(app)
    .post('/api/player')
    .send({ name: 'Hanako' });
  createdPlayerIds[1] = responseHanako.body.id;

  console.log('created player ids: ', createdPlayerIds);
});

// afterEach(async () => {
//   await resetDatabase(); // 各テスト後にリセット
// });

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});


describe('Match APIのテスト', () => {

  it('POST /match - 新しい試合が作成される(Home勝利)', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.homePlayerId).toBe(createdPlayerIds[0]);
    expect(response.body.awayPlayerId).toBe(createdPlayerIds[1]);
    expect(response.body.homeScore).toBe(1);
    expect(response.body.awayScore).toBe(0);

    // TODO: 勝点の確認(GET /player/:id開発後)

  });

  it('POST /match - 新しい試合が作成される(away勝利)', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 3,
        awayScore: 4
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.homePlayerId).toBe(createdPlayerIds[0]);
    expect(response.body.awayPlayerId).toBe(createdPlayerIds[1]);
    expect(response.body.homeScore).toBe(3);
    expect(response.body.awayScore).toBe(4);

    // TODO: 勝点の確認(GET /player/:id開発後)

  });
  it('POST /match - 新しい試合が作成される(ドロー)', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 2,
        awayScore: 2
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.homePlayerId).toBe(createdPlayerIds[0]);
    expect(response.body.awayPlayerId).toBe(createdPlayerIds[1]);
    expect(response.body.homeScore).toBe(2);
    expect(response.body.awayScore).toBe(2);

    // TODO: 勝点の確認(GET /player/:id開発後)

  });

  it("POST /match - リクエストボディにhomePlayerId指定がないときは400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(400);
  });

  it("POST /match - リクエストボディにawayPlayerId指定がないときは400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(400);
  });

  it("POST /match - リクエストボディにhomeScore指定がないときは400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        awayScore: 0
      });

    expect(response.status).toBe(400);
  });

  it("POST /match - リクエストボディにawayScore指定がないときは400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
      });

    expect(response.status).toBe(400);
  });

  it("POST /match - homeScoreがマイナスの時は400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: -1,
        awayScore: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("スコアは0以上で指定して下さい。");
  });

  it("POST /match - awayScoreがマイナスの時は400", async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: -1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("スコアは0以上で指定して下さい。");
  });

  it('GET /matches - 全ての試合が取得できる', async () => {
    const response = await request(app).get('/api/matches');

    expect(response.status).toBe(200);
    expect(response.body.results.length).toBe(3);
    expect(response.body.results[0]).toHaveProperty('homePlayerId');
    expect(response.body.results[0]).toHaveProperty('awayPlayerId');
    expect(response.body.results[0]).toHaveProperty('homeScore');
    expect(response.body.results[0]).toHaveProperty('awayScore');
  });
});
