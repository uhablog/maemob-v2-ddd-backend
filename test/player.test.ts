import request from 'supertest';
import app from '../src/index';  // エントリーポイント
import { closeDatabase, resetDatabase } from './setupDatabase';

beforeAll(async () => {
  await resetDatabase(); // テスト開始前にデータベースを初期化
});

// afterEach(async () => {
//   await resetDatabase(); // 各テストごとにデータをリセット
// });

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});

describe('Player API', () => {

  it('POST /player - 新しいユーザーが作成される', async () => {
    const response = await request(app)
      .post('/api/player')
      .send({ name: 'Taro' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Taro');
  });

  it("POST /player - 名前のリクエストがない場合は400エラーが返ってくることの確認", async () => {
    const response = await request(app)
      .post('/api/player')
      .send({});

    expect(response.status).toBe(400);
  });

  it('GET /players - 全てのプレイヤーが取得できる', async () => {
    const response = await request(app).get('/api/players');

    console.log('test body: ', response.body.results[0]);
    console.log('test status: ', response.status);
    console.log('test results.length: ', response.body.results.length);
    expect(response.status).toBe(200);
    expect(response.body.results.length).toBeGreaterThan(0);  // プレイヤーが存在することを確認
    expect(response.body.results[0]).toHaveProperty('name');
  });
});
