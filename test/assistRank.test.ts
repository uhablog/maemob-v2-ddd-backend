import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import { app, server } from '../src/index';
import { closeDatabase } from "./setupDatabase";

let testData: TestData;
beforeEach(async () => {
  testData = await createTestData();
});

afterAll(async () => {
  await closeDatabase();
});

const ERROR_MESSAGES = {
  missingConventionOrPlayerId: "convention_idもしくはplayer_idどちらか1つを指定して下さい。",
  invalidConventionIdFormat: "convention_idはUUID形式で指定して下さい。",
  invalidPlayerIdFormat: "player_idはUUID形式で指定して下さい。"
}

/**
 * アシストを作成する
 * @param conventionId 大会ID
 * @param matchId 試合ID
 * @param playerId プレイヤーID
 * @param name アシスト
 * @returns レスポンス
 */
const createAssist = async (conventionId: string, matchId: string, playerId: string, name: string) => {
  return await request(app)
    .post(`/api/conventions/${conventionId}/matches/${matchId}/assists`)
    .send([{ player_id: playerId, name }]);
};

type TestData = {
  conventionId: string
  playerIds: string[]
  matchIds: string[]
}
/**
 * テストデータの作成
 * 大会やプレイヤーを作成する
 * 以下の数作成
 * 大会      : 1
 * プレイヤー : 3
 * 試合      : 2
 * Iniesta  : 4
 * Kroos    : 2
 * Koke     : 1
 * Fed      : 1
 * Pedri    : 1
 * Gavi     : 1
 */
const createTestData = async (): Promise<TestData> => {
  const convention = await request(app)
    .post(`/api/conventions`)
    .send({ name: "test convention" });

  const conventionId = convention.body.id;
  
  const player1 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Taro' });
  const player1Id = player1.body.id as string;

  const player2 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Hanako' });
  const player2Id = player2.body.id as string;

  const player3 = await request(app)
    .post(`/api/conventions/${conventionId}/players`)
    .send({ name: 'Saburo' });
  const player3Id = player3.body.id as string;

  const match1 = await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: player1Id,
      awayPlayerId: player2Id,
      homeScore: 4,
      awayScore: 3
    });

  await createAssist(conventionId, match1.body.id, player1Id, "Iniesta");
  await createAssist(conventionId, match1.body.id, player1Id, "Iniesta");
  await createAssist(conventionId, match1.body.id, player1Id, "Iniesta");
  await createAssist(conventionId, match1.body.id, player1Id, "Pedri");
  await createAssist(conventionId, match1.body.id, player2Id, "Kroos");
  await createAssist(conventionId, match1.body.id, player2Id, "Kroos");
  await createAssist(conventionId, match1.body.id, player2Id, "Fed");

  const match2 = await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: player1Id,
      awayPlayerId: player3Id,
      homeScore: 2,
      awayScore: 1
    });

  await createAssist(conventionId, match2.body.id, player1Id, "Iniesta");
  await createAssist(conventionId, match2.body.id, player1Id, "Gavi");
  await createAssist(conventionId, match2.body.id, player3Id, "Koke");

  return {
    conventionId,
    playerIds: [
      player1Id,
      player2Id,
      player3Id
    ],
    matchIds: [
      match1.body.id as string,
      match2.body.id as string,
    ]
  }
};

describe('【正常系】GET /assists アシストランキングの取得', () => {

  it('特定の大会のアシストランキングが取得できる', async () => {

    try {
      const response = await request(app)
        .get(`/api/assists?convention_id=${testData.conventionId}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(6)
      expect(response.body[0].name).toBe("Iniesta");
      expect(response.body[0].assist_count).toBe(4);
      expect(response.body[0].player_id).toBe(testData.playerIds[0]);
      expect(response.body[1].name).toBe("Kroos");
      expect(response.body[1].assist_count).toBe(2);
      expect(response.body[1].player_id).toBe(testData.playerIds[1]);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  it('特定のプレイヤー(チーム)のアシストランキングが取得できる', async () => {

    try {
      
      const response = await request(app)
        .get(`/api/assists?player_id=${testData.playerIds[1]}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2)
      expect(response.body[0].name).toBe("Kroos");
      expect(response.body[0].assist_count).toBe(2);
      expect(response.body[0].player_id).toBe(testData.playerIds[1]);
      expect(response.body[1].name).toBe("Fed");
      expect(response.body[1].assist_count).toBe(1);
      expect(response.body[1].player_id).toBe(testData.playerIds[1]);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }
  });

});

describe('【異常系】GET /assists アシストランキングの取得', () => {

  /**
   * HTTP Bad Request Error: 400
   */
  it('大会・プレイヤーどちらも指定されていない', async () => {

    try {
      const response = await request(app)
        .get(`/api/assists`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.missingConventionOrPlayerId);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  it('大会・プレイヤーどちら指定されている', async () => {

    try{
      const response = await request(app)
        .get(`/api/assists?convention_id=${uuidv4()}&player_id=${1}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.missingConventionOrPlayerId);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  it('指定したconvention idがuuid形式ではない', async () => {

    try {
      const response = await request(app)
        .get(`/api/assists?convention_id=string`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.invalidConventionIdFormat);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }
  });

  it('指定したplayer idが1以上の整数ではない', async () => {

    try {
      const response = await request(app)
        .get(`/api/assists?player_id=0`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.invalidPlayerIdFormat);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  /**
   * HTTP Not Found Error: 404
   */
  it('指定したconvention idが存在しない', async () => {

    try {
      const testUUID = uuidv4();
      const response = await request(app)
        .get(`/api/assists?convention_id=${testUUID}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(`convention id: ${testUUID} not found`);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  it('指定したplayer idが存在しない', async () => {

    try {
      const testPlayerId = uuidv4();
      const response = await request(app)
        .get(`/api/assists?player_id=${testPlayerId}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(`player id: ${testPlayerId} not found`);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });
});