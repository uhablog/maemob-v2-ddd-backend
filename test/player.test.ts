import request from 'supertest';
import app from '../src/index';  // エントリーポイント

describe('Player API', () => {
  it('POST /player - 新しいユーザーが作成される', async () => {
    const response = await request(app)
      .post('/player')
      .send({ name: 'Taro' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Taro');
  });

  it("POST /player - 名前のリクエストがない場合は400エラーが返ってくることの確認", async () => {
    const response = await request(app)
      .post('/player')
      .send({});

    expect(response.status).toBe(400);
  });

  it('GET /players - 全てのプレイヤーが取得できる', async () => {
    const response = await request(app).get('/players');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);  // プレイヤーが存在することを確認
    expect(response.body[0]).toHaveProperty('name');
  });
});
