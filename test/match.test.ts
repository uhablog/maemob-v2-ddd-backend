import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import {app} from '../src/index';  // エントリーポイント

import { closeDatabase } from './setupDatabase';

const createdPlayerIds: number[] = [];
let createdConventionId: string = "";

const ERROR_MESSAGES = {
  invalidScore: "スコアは0以上で指定して下さい。",
  invalidConventionIdFormat: "convention idはUUID形式で指定して下さい",
  invalidRequestBody: "全てのプロパティを指定して下さい。",
  invalidMatchIdFormat: "idはUUID形式で指定して下さい",
}

beforeAll(async () => {

  const responseConvention = await request(app)
    .post('/api/conventions')
    .send({ name: "League1", held_date: "2024-10-25" });
  createdConventionId = responseConvention.body.id;

  const responseTaro = await request(app)
    .post(`/api/conventions/${createdConventionId}/players`)
    .send({ name: 'Taro' });
  createdPlayerIds[0] = responseTaro.body.id;

  const responseHanako = await request(app)
    .post(`/api/conventions/${createdConventionId}/players`)
    .send({ name: 'Hanako' });
  createdPlayerIds[1] = responseHanako.body.id;
});

afterAll(async () => {
  await closeDatabase(); // テスト終了後に接続を終了
});


describe('【正常系】POST /matches 試合の作成', () => {

  it('新しい試合が作成される(Home勝利)', async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
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

    // 勝点の確認
    const responseTaro = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[0]}`)
      .send()
    
    // 勝者はプラス3
    expect(responseTaro.status).toBe(200);
    expect(responseTaro.body.id).toBe(createdPlayerIds[0]);
    expect(responseTaro.body.name).toBe('Taro');
    expect(responseTaro.body.points).toBe(3);

    const responseHanako = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[1]}`)
      .send()
    
    // 敗者はプラス0
    expect(responseHanako.status).toBe(200);
    expect(responseHanako.body.id).toBe(createdPlayerIds[1]);
    expect(responseHanako.body.name).toBe('Hanako');
    expect(responseHanako.body.points).toBe(0);

  });

  it('新しい試合が作成される(away勝利)', async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
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

    // 勝点の確認
    const responseTaro = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[0]}`)
      .send()
    
    // 敗者はプラス0
    expect(responseTaro.status).toBe(200);
    expect(responseTaro.body.id).toBe(createdPlayerIds[0]);
    expect(responseTaro.body.name).toBe('Taro');
    expect(responseTaro.body.points).toBe(3);

    const responseHanako = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[1]}`)
      .send()
    
    // 勝者はプラス3
    expect(responseHanako.status).toBe(200);
    expect(responseHanako.body.id).toBe(createdPlayerIds[1]);
    expect(responseHanako.body.name).toBe('Hanako');
    expect(responseHanako.body.points).toBe(3);

  });
  it('新しい試合が作成される(ドロー)', async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
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

    // 勝点の確認(引き分けで両者勝点1)
    const responseTaro = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[0]}`)
      .send()
    
    expect(responseTaro.status).toBe(200);
    expect(responseTaro.body.id).toBe(createdPlayerIds[0]);
    expect(responseTaro.body.name).toBe('Taro');
    expect(responseTaro.body.points).toBe(4);

    const responseHanako = await request(app)
      .get(`/api/conventions/${createdConventionId}/player/${createdPlayerIds[1]}`)
      .send()
    
    expect(responseHanako.status).toBe(200);
    expect(responseHanako.body.id).toBe(createdPlayerIds[1]);
    expect(responseHanako.body.name).toBe('Hanako');
    expect(responseHanako.body.points).toBe(4);
  });
});

describe('【異常系】POST /matches', () => {
  it("リクエストボディにhomePlayerId指定がないときは400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidRequestBody);
  });

  it("リクエストボディにawayPlayerId指定がないときは400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        homeScore: 1,
        awayScore: 0
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidRequestBody);
  });

  it("リクエストボディにhomeScore指定がないときは400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        awayScore: 0
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidRequestBody);
  });

  it("リクエストボディにawayScore指定がないときは400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidRequestBody);
  });

  it("homeScoreがマイナスの時は400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: -1,
        awayScore: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidScore);
  });

  it("awayScoreがマイナスの時は400", async () => {
    const response = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: -1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidScore);
  });

  it("convention idがUUID形式でないときは400エラー", async () => {
    const response = await request(app)
      .post(`/api/conventions/test/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: 0 
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidConventionIdFormat);
  });

  it("指定したconvention idの大会が存在しない場合は404エラー", async () => {
    const testUUID = uuidv4();
    const response = await request(app)
      .post(`/api/conventions/${testUUID}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 1,
        awayScore: 0 
      });
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);
  });
});

describe ('【正常系】GET /matches 試合の取得', () => {

  it('全ての試合が取得できる', async () => {
    const response = await request(app).get(`/api/conventions/${createdConventionId}/matches`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty('homePlayerId');
    expect(response.body[0]).toHaveProperty('awayPlayerId');
    expect(response.body[0]).toHaveProperty('homeScore');
    expect(response.body[0]).toHaveProperty('awayScore');
  });

});

describe('【異常系】GET /matches 試合の取得', () => {

  it('指定したIdの大会が存在しない', async () => {
    const testUUID = uuidv4();
    const response = await request(app)
      .get(`/api/conventions/${testUUID}/matches`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);
  });
});

describe('【正常系】試合の取得(ID指定)', () => {

  it('【正常系】GET /match/{id} - 指定したIDの試合が取得できる', async () => {

    const responseCreate = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches`)
      .send({
        homePlayerId: createdPlayerIds[0],
        awayPlayerId: createdPlayerIds[1],
        homeScore: 4,
        awayScore: 3
      });

    const createdMatchId = responseCreate.body.id;

    // 試合の得点者を登録
    const responseCreateScorers = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches/${createdMatchId}/scorers`)
      .send([
        {
          player_id: createdPlayerIds[0],
          name: "Leo Messi"
        },
        {
          player_id: createdPlayerIds[0],
          name: "Leo Messi"
        },
        {
          player_id: createdPlayerIds[0],
          name: "Leo Messi"
        },
        {
          player_id: createdPlayerIds[0],
          name: "Leo Messi"
        },
        {
          player_id: createdPlayerIds[1],
          name: "CR7"
        },
        {
          player_id: createdPlayerIds[1],
          name: "CR7"
        },
        {
          player_id: createdPlayerIds[1],
          name: "CR7"
        }
      ]);

    // 試合のアシストを登録
    const responseCreateAssists = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches/${createdMatchId}/assists`)
      .send([
        {
          player_id: createdPlayerIds[0],
          name: "Iniesta"
        },
        {
          player_id: createdPlayerIds[0],
          name: "Xavi"
        },
        {
          player_id: createdPlayerIds[1],
          name: "Kroos"
        },
        {
          player_id: createdPlayerIds[1],
          name: "Kroos"
        },
        {
          player_id: createdPlayerIds[1],
          name: "Kroos"
        }
      ]);
    
    // 試合のMOMを登録
    const responseCreateMom = await request(app)
      .post(`/api/conventions/${createdConventionId}/matches/${createdMatchId}/mom`)
      .send({
        player_id: createdPlayerIds[0],
        name: "Leo Messi"
      });

    
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/match/${createdMatchId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.homePlayerId).toBe(createdPlayerIds[0]);
    expect(response.body.awayPlayerId).toBe(createdPlayerIds[1]);
    expect(response.body.homeScore).toBe(4);
    expect(response.body.awayScore).toBe(3);
    expect(response.body.homePlayerName).toBe("Taro");
    expect(response.body.awayPlayerName).toBe("Hanako");
    expect(response.body.mom).toBe("Leo Messi");
    expect(response.body.homeScorers.length).toBe(4);
    expect(response.body.homeScorers[0].name).toBe("Leo Messi");
    expect(response.body.homeAssists.length).toBe(3);
    expect(response.body.homeAssists[0].name).toBe("Iniesta");
    expect(response.body.awayScorers.length).toBe(3);
    expect(response.body.awayScorers[0].name).toBe("CR7");
    expect(response.body.awayAssists.length).toBe(3);
    expect(response.body.awayAssists[0].name).toBe("Kroos");

  });
});

describe('【異常系】試合の取得(ID指定)', () => {
  it('指定したIDの試合がない', async () => {

    const testMatchId = uuidv4();
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/match/${testMatchId}`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`match id ${testMatchId} not found`);
  });

  it('IDの指定が不適切(string)', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/match/string`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidMatchIdFormat);
  });

  it('IDの指定が不適切(0)', async () => {
    const response = await request(app)
      .get(`/api/conventions/${createdConventionId}/match/0`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidMatchIdFormat);
  });
});
