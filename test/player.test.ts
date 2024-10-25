import request from 'supertest';
import app from '../src/index';  // エントリーポイント
import { closeDatabase, resetDatabase } from './setupDatabase';
import { v4 as uuidv4 } from 'uuid';

let createdConventionId: string = "";

beforeAll(async () => {
  await resetDatabase(); // テスト開始前にデータベースを初期化

  const responseConvention = await request(app)
    .post('/api/conventions')
    .send({ name: "League1", held_date: "2024-10-25" });
  createdConventionId = responseConvention.body.id;
});

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});

const createdPlayerIds: number[] = [];

describe('Player API', () => {

  /**
   * Post /player
   */
  it('【正常系】POST /player - 新しいプレイヤーが作成される', async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Taro' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Taro');
    createdPlayerIds.push(response.body.id as number);
  });

  it("【異常系】POST /player - 名前のリクエストがない場合は400エラーが返ってくることの確認", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({});

    expect(response.status).toBe(400);
  });

  /**
   * Get /players
   */
  it('【正常系】GET /players - 全てのプレイヤーが取得できる', async () => {

    // プレイヤー作成
    const responsePost = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Hanako' });

    createdPlayerIds.push(responsePost.body.id as number);

    // プレイヤーが2人いることの確認
    const response = await request(app).get(`/api/conventions/${createdConventionId}/players`);

    expect(response.status).toBe(200);
    expect(response.body.results.length).toBeGreaterThan(2);  // プレイヤーが存在することを確認
    expect(response.body.results[0]).toHaveProperty('name');
    expect(response.body.results[0].name).toBe('Taro');
    expect(response.body.results[1].name).toBe('Hanako');
  });

  it('【異常系】GET /players - 指定したIdの大会が存在しない', async () => {
    const response = await request(app)
      .get(`/api/conventions/${uuidv4()}/players`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("指定されたIDの大会は存在しません。");
  });

  /**
   * Get /player
   */
  it('【正常系】GET /player/{id} - 指定したIDのプレイヤーが取得できる', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[0]}`)
      .send()
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdPlayerIds[0]);
    expect(response.body.name).toBe('Taro');
  });

  it('【異常系】GET /player/{id} - 指定したIdのユーザーがいない', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/1000`)
      .send();

    expect(response.status).toBe(404);
  });

  it('【異常系】GET /player/{id} - IDの指定が不適切(string)', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/string`)
      .send();

    expect(response.status).toBe(400);
  });

  it('【異常系】GET /player/{id} - IDの指定が不適切(0)', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/0`)
      .send();

    expect(response.status).toBe(400);
  });
});
