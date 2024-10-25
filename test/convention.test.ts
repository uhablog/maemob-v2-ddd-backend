import request from 'supertest';
import app from '../src/index';
import { closeDatabase, resetDatabase } from "./setupDatabase";
import { getToday, getTomorrowDate } from './getDate';

beforeAll(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase(); // 各テスト後にリセット
});

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});


describe('【正常系】大会の作成', () => {

  it('POST /conventions - 新しい大会が登録される(開催日指定)', async () => {
    const response = await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League1",
        held_date: getTomorrowDate()
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("League1");
    expect(response.body.held_date).toBe(getTomorrowDate());
  });

  it('POST /conventions - 新しい大会が登録される(開催日指定なし)', async () => {
    const response = await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League1"
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("League1");
    expect(response.body.held_date).toBe(getToday());
  });
});

describe('【異常系】大会の作成', () => {

  it('POST /conventions - name指定なし', async () => {
    const response = await request(app)
      .post(`/api/conventions`)
      .send({
        held_date: getTomorrowDate()
      });

    expect(response.status).toBe(400);
  });

  it('POST /conventions - 開催日の指定がyyyy-mm-dd以外', async () => {
    const response = await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League1",
        held_date: getToday().replaceAll('-', '/')
      });

    expect(response.status).toBe(400);
  });

});

describe('【正常系】大会の取得', () => {

  it('作成した大会が取得できる', async () => {

    // テスト用データ取得
    await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League1",
        held_date: getTomorrowDate()
      });
    await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League2",
        held_date: getTomorrowDate()
      });
    await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League3",
        held_date: getTomorrowDate()
      });
    
    const getConventoinResponse = await request(app)
      .get(`/api/conventions`)
      .send();

    expect(getConventoinResponse.status).toBe(200);
    expect(getConventoinResponse.body.length).toBe(3);
    expect(getConventoinResponse.body[0].name).toBe("League1");
    expect(getConventoinResponse.body[1].name).toBe("League2");
    expect(getConventoinResponse.body[2].name).toBe("League3");
  });
});