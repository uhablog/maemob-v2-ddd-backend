import request from 'supertest';

import app from '../src/index';  // エントリーポイント

import { resetDatabase, closeDatabase } from './setupDatabase';

beforeAll(async () => {
  await resetDatabase(); // テスト開始前にデータベースを初期化
});

// afterEach(async () => {
//   await resetDatabase(); // 各テストごとにデータをリセット
// });

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});


describe('Match APIのテスト', () => {
  it('case1: POST /match - 新しい試合が作成される', async () => {
    const response = await request(app)
      .post('/match')
      .send({
        homePlayer: "Taro",
        awayPlayer: "Hanako",
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.homePlayer).toBe('Taro');
    expect(response.body.awayPlayer).toBe('Hanako');
    expect(response.body.homeScore).toBe(1);
    expect(response.body.awayScore).toBe(0);
  });

  it("case2: POST /match - リクエストボディの指定がないときは400", async () => {
    const response = await request(app)
      .post('/match')
      .send({});

    expect(response.status).toBe(400);
  });

  it('GET /matches - 全ての試合が取得できる', async () => {
    const response = await request(app).get('/matches');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);  // 試合が存在することを確認
    expect(response.body[0]).toHaveProperty('homePlayer');
  });
});
