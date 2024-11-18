import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import app from '../src/index';
import { closeDatabase } from './setupDatabase';

afterAll(async () => {
  await closeDatabase();
});

const ERROR_MESSAGES = {
  noName: "nameは入力必須です。",
  noPlayerId: "player_idは入力必須です。",
  invalidPlayerIdFormat: "player_idはUUID形式で指定して下さい。",
  invalidConventionIdFormat: "convention_idはUUID形式で指定して下さい。",
  invalidMatchIdFormat: "match_idはUUID形式で指定して下さい。",
  noMatchedPlayer: "試合を行ったユーザーを指定して下さい。",
  overAssistHome: "ホームチームのアシスト数が得点数に到達しました。",
  overAssistAway: "アウェイチームのアシスト数が得点数に到達しました。",
}

/**
 * テスト用に大会・プレイヤー・試合を作成する
 */
const createPlayerAndConventionAndMatch = async () => {
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
    .send({ name: 'Taro' });
  const player2Id = player2.body.id;

  const match = await request(app)
    .post(`/api/conventions/${conventionId}/matches`)
    .send({
      homePlayerId: player1Id,
      awayPlayerId: player2Id,
      homeScore: 4,
      awayScore: 3
    });

  return {
    conventionId,
    playerIds: [
      player1Id,
      player2Id
    ],
    matchId: match.body.id
  }
};

describe('【正常系】POST /assist アシストの作成', () => {

  it('アシストの登録ができる', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.match_id).toBe(testData.matchId);
    expect(response.body.player_id).toBe(testData.playerIds[0]);
    expect(response.body.name).toBe("Leo Messi");
  });

});

describe('【異常系】POST /assists アシストの作成', () => {

  /**
   * HTTP Bad Request Error: 400
   */
  it('nameの指定がない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.noName);
  });

  it('player_idの指定がない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.noPlayerId);
  });

  it('player_idがUUID形式でない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: 'string',
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidPlayerIdFormat);
  });

  it('convention_idがUUID形式でない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/string/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidConventionIdFormat);
  });

  it('match_idがUUID形式でない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/string/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidMatchIdFormat);
  });

  it('指定したplayer_idがmatchに関係ない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: uuidv4(),
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.noMatchedPlayer);
  });

  it('アシスト数が試合の得点数を超える', async () => {

    const testData = await createPlayerAndConventionAndMatch();

    // アシストの作成
    const responsePostAssists1 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssists2 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssists3 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssists4 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssists5 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    expect(responsePostAssists5.status).toBe(400);
    expect(responsePostAssists5.body.message).toBe(ERROR_MESSAGES.overAssistHome);

    // アシストの作成
    const responsePostAssistsAway1 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "Leo Messi"
      });
    const responsePostAssistsAway2 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "Leo Messi"
      });
    const responsePostAssistsAway3 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "Leo Messi"
      });
    const responsePostAssistsAway4 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "Leo Messi"
      });
    expect(responsePostAssistsAway4.status).toBe(400);
    expect(responsePostAssistsAway4.body.message).toBe(ERROR_MESSAGES.overAssistAway);
  });
  
  
  /**
   * HTTP Not Found Error: 404
   */
  it('指定したconvention_idが存在しない場合404', async () => {

    const testUUID = uuidv4();
    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testUUID}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);
  });

  it('指定したmatch_idが存在しない場合404', async () => {

    const testMatchId = '5000'
    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testMatchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`match id: ${testMatchId} not found`);
  });

});

describe('【正常系】GET /assists アシストの取得', () => {

  it('アシストが取得できる', async () => {
    const testData = await createPlayerAndConventionAndMatch();
    
    // アシストの作成
    const responsePostAssists1 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssistss2 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssistss3 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "C. Ronald"
      });
    
    const response = await request(app)
      .get(`/api/conventions/${testData.conventionId}/matches/${testData.matchId}/assists`)
      .send();
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("match_id");
    expect(response.body[0]).toHaveProperty("player_id");
    expect(response.body[0]).toHaveProperty("name");
  });

});

describe('【異常系】GET /assists アシストの取得', () => {

  /**
   * HTTP Status 400
   */
  it('convention_idがUUID形式でない場合は400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/no-uuid/matches/${testData.matchId}/assists`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidConventionIdFormat);

  });

  it('match_idがUUID形式でない場合は400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/${testData.conventionId}/matches/no-uuid/assists`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGES.invalidMatchIdFormat);
  });

  /**
   * HTTP Status 404
   */
  it('指定したconvention_idが存在しない場合404', async () => {

    const testUUID = uuidv4();
    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/${testUUID}/matches/${testData.matchId}/assists`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`convention id: ${testUUID} not found`);

  });
  it('指定したmatch_idが存在しない場合404', async () => {

    const testMatchId = '5000'
    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/${testData.conventionId}/matches/${testMatchId}/assists`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`match id: ${testMatchId} not found`);
  });

});