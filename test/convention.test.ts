import request from 'supertest';
import {app} from '../src/index';
import { closeDatabase } from "./setupDatabase";
import { getToday, getTomorrowDate } from './getDate';
import { v4 as uuidv4 } from 'uuid';

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
    expect(getConventoinResponse.body.length).toBeGreaterThanOrEqual(3);
    expect(getConventoinResponse.body[0]).toHaveProperty("name");
    expect(getConventoinResponse.body[0]).toHaveProperty("held_date");
  });
});

describe("【正常系】大会の取得(ID指定)", () => {

  it("作成した試合が取得できる", async () => {

    // 取得用の大会を作成
    const createdConvention = await request(app)
      .post(`/api/conventions`)
      .send({
        name: "League1",
        held_date: getTomorrowDate()
      });

    const response = await request(app)
      .get(`/api/convention/${createdConvention.body.id}`)
      .send();
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdConvention.body.id);
    expect(response.body.name).toBe(createdConvention.body.name);
    expect(response.body.held_date).toBe(createdConvention.body.held_date);
  });
});

describe("【異常系】大会の取得(ID指定)", () => {

  it("指定したIDの大会がない", async () => {
    const testConventionId = uuidv4();
    const response = await request(app)
      .get(`/api/convention/${testConventionId}`)
      .send();
    expect(response.status).toBe(404);
  });

  it("IDの指定がuuid形式ではない", async () => {
    const response = await request(app)
      .get(`/api/convention/string`)
      .send();
    expect(response.status).toBe(400);
  });
});
