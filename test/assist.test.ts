import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import app from '../src/index';
import { closeDatabase, resetDatabase } from './setupDatabase';

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

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
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("match_id");
    expect(response.body).toHaveProperty("player_id");
    expect(response.body).toHaveProperty("name");
  });

});

describe('【異常系】POST /assists アシストの作成', () => {

  // 400
  it('nameの指定がない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("nameは入力必須です。");
  });

  it('player_idの指定がない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("player_idは入力必須です。");
  });

  it('player_idが数字でない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: 'string',
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("player_idは1以上の整数で指定して下さい。");
  });

  it('指定したplayer_idがmatchに関係ない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: 5000,
        name: "Leo Messi"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("試合を行ったユーザーを指定して下さい。");
  });
  
  // 404
  it('指定したconvention_idが存在しない場合404', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${uuidv4()}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("指定した大会もしくは試合が存在しません。");
  });

  it('指定したmatch_idが存在しない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/5000/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("指定した大会もしくは試合が存在しません。");
  });

});

describe('【正常系】GET /assists アシストの取得', () => {

  it('アシストが取得できる', async () => {
    const testData = await createPlayerAndConventionAndMatch();
    
    // アシストの作成
    const responsePostAssists1 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssistss2 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[0],
        name: "Leo Messi"
      });
    const responsePostAssistss3 = await request(app)
      .post(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
      .send({
        player_id: testData.playerIds[1],
        name: "C. Ronald"
      });
    
    const response = await request(app)
      .get(`/api/conventions/${testData.conventionId}/match/${testData.matchId}/assists`)
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

  // 404
  it('指定したconvention_idが存在しない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/${uuidv4()}/match/${testData.matchId}/assists`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("指定した大会もしくは試合が存在しません。");

  });
  it('指定したmatch_idが存在しない場合400', async () => {

    const testData = await createPlayerAndConventionAndMatch();
    const response = await request(app)
      .get(`/api/conventions/${testData.conventionId}/match/5000/assists`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("指定した大会もしくは試合が存在しません。");
  });

});