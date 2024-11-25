import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import app from "../src";
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
 * MOMを作成する
 * @param conventionId 大会ID
 * @param matchId 試合ID
 * @param playerId プレイヤーID
 * @param name MOMの名前
 * @returns レスポンス
 */
const createMom = async (conventionId: string, matchId: string, playerId: string, name: string) => {
  return await request(app)
    .post(`/api/conventions/${conventionId}/matches/${matchId}/mom`)
    .send({ player_id: playerId, name });
};

const createMatch = async (
  conventionId: string,
  homePlayerId: string,
  awayPlayerId: string,
  homeScore: number,
  awayScore: number
) => {
  return await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: homePlayerId,
      awayPlayerId: awayPlayerId,
      homeScore: homeScore,
      awayScore: awayScore
    });
}

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
 * Messi    : 3
 * Kroos    : 2
 * Suarez   : 1
 * Grie     : 1
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

  const match1 = await createMatch(conventionId, player1Id, player2Id, 4, 3);
  const match2 = await createMatch(conventionId, player1Id, player3Id, 1, 0);
  const match3 = await createMatch(conventionId, player2Id, player3Id, 1, 0);
  const match4 = await createMatch(conventionId, player3Id, player1Id, 1, 0);
  const match5 = await createMatch(conventionId, player3Id, player2Id, 1, 0);
  const match6 = await createMatch(conventionId, player2Id, player1Id, 1, 0);
  const match7 = await createMatch(conventionId, player2Id, player1Id, 1, 0);

  await createMom(conventionId, match1.body.id, player1Id, "Messi");
  await createMom(conventionId, match2.body.id, player1Id, "Messi");
  await createMom(conventionId, match3.body.id, player2Id, "Kroos");
  await createMom(conventionId, match4.body.id, player1Id, "Messi");
  await createMom(conventionId, match5.body.id, player3Id, "Grie");
  await createMom(conventionId, match6.body.id, player1Id, "Suarez");
  await createMom(conventionId, match7.body.id, player2Id, "Kroos");

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
      match3.body.id as string,
      match4.body.id as string,
      match5.body.id as string,
      match6.body.id as string,
      match7.body.id as string,
    ]
  }
};

describe('【正常系】GET /mom MOMランキングの取得', () => {

  it('特定の大会のMOMランキングが取得できる', async () => {

    try {
      const response = await request(app)
        .get(`/api/mom?convention_id=${testData.conventionId}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4)
      expect(response.body[0].name).toBe("Messi");
      expect(response.body[0].mom_count).toBe(3);
      expect(response.body[0].player_id).toBe(testData.playerIds[0]);
      expect(response.body[1].name).toBe("Kroos");
      expect(response.body[1].mom_count).toBe(2);
      expect(response.body[1].player_id).toBe(testData.playerIds[1]);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });

  it('特定のプレイヤー(チーム)のMOMランキングが取得できる', async () => {

    try {
      
      const response = await request(app)
        .get(`/api/mom?player_id=${testData.playerIds[0]}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2)
      expect(response.body[0].name).toBe("Messi");
      expect(response.body[0].mom_count).toBe(3);
      expect(response.body[0].player_id).toBe(testData.playerIds[0]);
      expect(response.body[1].name).toBe("Suarez");
      expect(response.body[1].mom_count).toBe(1);
      expect(response.body[1].player_id).toBe(testData.playerIds[0]);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }
  });

});

describe('【異常系】GET /mom MOMランキングの取得', () => {

  /**
   * HTTP Bad Request Error: 400
   */
  it('大会・プレイヤーどちらも指定されていない', async () => {

    try {
      const response = await request(app)
        .get(`/api/mom`)
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
        .get(`/api/mom?convention_id=${uuidv4()}&player_id=${1}`)
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
        .get(`/api/mom?convention_id=string`)
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
        .get(`/api/mom?player_id=0`)
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
        .get(`/api/mom?convention_id=${testUUID}`)
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
        .get(`/api/mom?player_id=${testPlayerId}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(`player id: ${testPlayerId} not found`);
    } catch (error) {
      console.error("Error occurred during test execution", error);
      throw error;
    }

  });
});