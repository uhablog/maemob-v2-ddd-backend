import request from 'supertest';
import app from '../src/index';  // エントリーポイント
import { closeDatabase, resetDatabase } from './setupDatabase';

import { v4 as uuidv4 } from 'uuid';

// beforeAll(async () => {
//   await resetDatabase(); // テスト開始前にデータベースを初期化
// });

// afterEach(async () => {
//   await resetDatabase();
// });

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});

describe('【正常系】プレイヤーの作成', () => {

  /**
   * Post /player
   */
  it('【正常系】POST /player - 新しいプレイヤーが作成される', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Taro' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Taro');
  });

});

describe('【異常系】POST /players - プレイヤーの作成', () => {

  it("名前のリクエストがない場合は400エラーが返ってくることの確認", async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("nameは必須です");
  });

  it("convention idがUUID形式ではないと400エラー", async () => {
    const response = await request(app)
      .post(`/api/conventions/test/players`)
      .send({ name: "Taro" });
    
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("convention idはUUID形式で指定して下さい");
  });

  it("指定したconvention idの大会が存在しない場合は404エラー", async () => {

    const testUUID = uuidv4();
    const response = await request(app)
      .post(`/api/conventions/${testUUID}/players`)
      .send({name: "Taro"});

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);
  });

});

describe('【正常系】プレイヤーの取得', () => {

  it('全てのプレイヤーが取得できる', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    // プレイヤー作成
    const createdPlayerIds: number[] = [];

    const responsePostTaro = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Taro' });
    const responsePost = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Hanako' });

    createdPlayerIds.push(responsePostTaro.body.id as number);
    createdPlayerIds.push(responsePost.body.id as number);

    // プレイヤーが2人いることの確認
    const response = await request(app).get(`/api/conventions/${createdConventionId}/players`);

    expect(response.status).toBe(200);
    expect(response.body.results.length).toBeGreaterThanOrEqual(2);  // プレイヤーが存在することを確認
    expect(response.body.results[0]).toHaveProperty('name');
    expect(response.body.results[0]).toHaveProperty('points');
  });

});

describe('【正常系】プレイヤーの取得(ID指定)', () => {
  /**
   * Get /player
   */
  it('【正常系】GET /player/{id} - 指定したIDのプレイヤーが取得できる', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const responsePostTaro = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Taro' });
    const createdPlayerId = responsePostTaro.body.id;

    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerId}`)
      .send()
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdPlayerId);
    expect(response.body.name).toBe('Taro');
  });

});

describe('【異常系】プレイヤーの取得(ID指定)', () => {

  it('指定したIdのユーザーがいない', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/1000`)
      .send();

    expect(response.status).toBe(404);
  });

  it('IDの指定が不適切(string)', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/string`)
      .send();

    expect(response.status).toBe(400);
  });

  it('IDの指定が不適切(0)', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/0`)
      .send();

    expect(response.status).toBe(400);
  });
});
