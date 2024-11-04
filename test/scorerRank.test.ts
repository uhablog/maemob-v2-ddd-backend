import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import app from "../src";
import { closeDatabase, resetDatabase } from "./setupDatabase";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

/**
 * テストデータの作成
 * 大会やプレイヤーを作成する
 * 以下の数作成
 * 大会      : 1
 * プレイヤー : 3
 * 試合      : 2
 * Leo Messi: 4
 * Vini     : 2
 * Gri      : 1
 * Fed      : 1
 * Gavi     : 1
 * Levi     : 1
 */
const createTestData = async () => {
  const convention = await request(app)
    .post(`/api/conventions`)
    .send({ name: "test convention" });

  const conventionId = convention.body.id;
  
  const player1 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Taro' });
  const player1Id = player1.body.id;

  const player2 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Hanako' });
  const player2Id = player2.body.id;

  const player3 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Saburo' });
  const player3Id = player3.body.id;

  const match1 = await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: player1Id,
      awayPlayerId: player2Id,
      homeScore: 4,
      awayScore: 3
    });
  const scorer1 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Leo Messi"
    });
  const scorer2 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Leo Messi"
    });
  const scorer3 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Leo Messi"
    });
  const scorer4 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Levi"
    });
  const scorer5 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player2Id,
      name: "Vini"
    });
  const scorer6 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player2Id,
      name: "Vini"
    });
  const scorer7 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match1.body.id}/scorers`)
    .send({
      player_id: player2Id,
      name: "Fed"
    });

  const match2 = await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: player1Id,
      awayPlayerId: player3Id,
      homeScore: 2,
      awayScore: 1
    });

  const scorer8 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match2.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Leo Messi"
    });
  const scorer9 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match2.body.id}/scorers`)
    .send({
      player_id: player1Id,
      name: "Gavi"
    });
  const scorer10 = await request(app)
    .post(`/api/conventions/${conventionId}/matches/${match2.body.id}/scorers`)
    .send({
      player_id: player3Id,
      name: "Gri"
    });

  return {
    conventionId,
    playerIds: [
      player1Id,
      player2Id,
      player3Id
    ],
    matchIds: [
      match1.body.id,
      match2.body.id,
    ]
  }
};

describe('【正常系】GET /scorers 得点ランキングの取得', () => {

  it('特定の大会の得点ランキングが取得できる', async () => {

    const testData = await createTestData();
    const response = await request(app)
      .get(`/api/scorers?convention_id=${testData.conventionId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(6)
    expect(response.body[0].name).toBe("Leo Messi");
    expect(response.body[0].score_count).toBe(4);
    expect(response.body[0].player_id).toBe(testData.playerIds[0]);
    expect(response.body[1].name).toBe("Vini");
    expect(response.body[1].score_count).toBe(2);
    expect(response.body[1].player_id).toBe(testData.playerIds[1]);

  });

  it('特定のプレイヤー(チーム)の得点ランキングが取得できる', async () => {

    const testData = await createTestData();
    const response = await request(app)
      .get(`/api/scorers?player_id=${testData.playerIds[1]}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2)
    expect(response.body[0].name).toBe("Vini");
    expect(response.body[0].score_count).toBe(2);
    expect(response.body[0].player_id).toBe(testData.playerIds[1]);
    expect(response.body[1].name).toBe("Fed");
    expect(response.body[1].score_count).toBe(1);
    expect(response.body[1].player_id).toBe(testData.playerIds[1]);
  });

});

describe('【異常系】GET /scorers 得点ランキングの取得', () => {

  /**
   * HTTP Bad Request Error: 400
   */
  it('大会・プレイヤーどちらも指定されていない', async () => {

    const response = await request(app)
      .get(`/api/scorers`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("convention_idもしくはplayer_idどちらか1つを指定して下さい。");

  });

  it('大会・プレイヤーどちら指定されている', async () => {

    const response = await request(app)
      .get(`/api/scorers?convention_id=${uuidv4()}&player_id=${1}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("convention_idもしくはplayer_idどちらか1つを指定して下さい。");

  });

  it('指定したconvention idがuuid形式ではない', async () => {

    const response = await request(app)
      .get(`/api/scorers?convention_id=string`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("convention_idはUUID形式で指定して下さい。");
  });

  it('指定したplayer idが1以上の整数ではない', async () => {

    const response = await request(app)
      .get(`/api/scorers?player_id=0`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("player_idは1以上の整数で指定して下さい。");

  });

  /**
   * HTTP Not Found Error: 404
   */
  it('指定したconvention idが存在しない', async () => {

    const testUUID = uuidv4();
    const response = await request(app)
      .get(`/api/scorers?convention_id=${testUUID}`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);

  });

  it('指定したplayer idが存在しない', async () => {

    const testPlayerId = 5000;
    const response = await request(app)
      .get(`/api/scorers?player_id=${testPlayerId}`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`player id: ${testPlayerId} not found`);

  });
});