import request from 'supertest';
import app from '../src/index';  // エントリーポイント
import { closeDatabase, resetDatabase } from './setupDatabase';

import { v4 as uuidv4 } from 'uuid';

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
    expect(response.body.points).toBe(0);
    expect(response.body.wins).toBe(0);
    expect(response.body.draws).toBe(0);
    expect(response.body.losses).toBe(0);
    expect(response.body.goals).toBe(0);
    expect(response.body.concede).toBe(0);
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

  it('全てのプレイヤーが勝ち点順で取得できる', async () => {

    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    // プレイヤー作成
    const responsePostTaro = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Taro' });
    const responsePostHanako = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Hanako' });
    const responsePostSaburo = await request(app)
      .post(`/api/conventions/${createdConventionId}/players`)
      .send({ name: 'Saburo' });

    /**
     * 試合結果を登録して勝ち点順に取得できるかチェックする
     * 太郎：勝点7 得点5 失点3
     * 花子：勝点4 得点5 失点4
     * 三郎：勝点0 得点2 失点5
     */
    await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: responsePostTaro.body.id,
        awayPlayerId: responsePostHanako.body.id,
        homeScore: 1,
        awayScore: 0
      });
    await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: responsePostTaro.body.id,
        awayPlayerId: responsePostHanako.body.id,
        homeScore: 2,
        awayScore: 2
      });
    await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: responsePostTaro.body.id,
        awayPlayerId: responsePostSaburo.body.id,
        homeScore: 2,
        awayScore: 1
      });
    await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: responsePostSaburo.body.id,
        awayPlayerId: responsePostHanako.body.id,
        homeScore: 1,
        awayScore: 3
      });

    // プレイヤーが2人いることの確認
    const response = await request(app).get(`/api/conventions/${createdConventionId}/players`);

    expect(response.status).toBe(200);
    expect(response.body.results.length).toBe(3);  // プレイヤーが存在することを確認
    expect(response.body[0].name).toBe('Taro');
    expect(response.body[0].points).toBe(7);
    expect(response.body[0].wins).toBe(2);
    expect(response.body[0].draws).toBe(1);
    expect(response.body[0].losses).toBe(0);
    expect(response.body[0].goals).toBe(5);
    expect(response.body[0].concede).toBe(3);

    expect(response.body[1].name).toBe('Hanako');
    expect(response.body[1].points).toBe(4);
    expect(response.body[1].wins).toBe(1);
    expect(response.body[1].draws).toBe(1);
    expect(response.body[1].losses).toBe(1);
    expect(response.body[1].goals).toBe(5);
    expect(response.body[1].concede).toBe(4);

    expect(response.body[2].name).toBe('Saburo');
    expect(response.body[2].points).toBe(0);
    expect(response.body[2].wins).toBe(0);
    expect(response.body[2].draws).toBe(0);
    expect(response.body[2].losses).toBe(2);
    expect(response.body[2].goals).toBe(2);
    expect(response.body[2].concede).toBe(5);
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
    expect(response.body.points).toBe(0);
    expect(response.body.wins).toBe(0);
    expect(response.body.draws).toBe(0);
    expect(response.body.losses).toBe(0);
    expect(response.body.goals).toBe(0);
    expect(response.body.concede).toBe(0);
  });

});

describe('【異常系】プレイヤーの取得(ID指定)', () => {

  it('指定したIdのユーザーがいない', async () => {
    const responseConvention = await request(app)
      .post('/api/conventions')
      .send({ name: "post player test League1", held_date: "2024-10-25" });
    const createdConventionId = responseConvention.body.id;

    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${uuidv4()}`)
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
