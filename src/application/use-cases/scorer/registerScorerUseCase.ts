import { Pool } from "pg";
import { Scorer } from "../../../domain/entities/scorer";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { IScorerRepository } from "../../../domain/repositories/scorerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { ScorerId } from "../../../domain/value-objects/scorerId";
import { ScorerName } from "../../../domain/value-objects/scorerName";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { RegisterScorerDTO } from "../../dto/registerScorerDto";
import { PlayerId } from "../../../domain/value-objects/playerId";
import { MatchId } from "../../../domain/value-objects/matchId";
import { Match } from "../../../domain/entities/match";

export class RegisterScorerUseCase {

  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {};


  async execute(
    data: RegisterScorerDTO[],
    matchId: string,
    conventionId: string
  ): Promise<string[]> {

    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    const matchIdObject = new MatchId(matchId);
    
    // playerがmatchしているか判定
    const match = await this.matchRepository.findById(client, matchIdObject);

    if (match == null) {
      throw new NotFoundError(`match id: ${matchId}`);
    }

    const checkOverScoreResult = await this.checkOverScore(data, match);

    if (!checkOverScoreResult['home']) {
      throw new BadRequestError(`ホームチームの得点者数がホームチームの得点数より多く指定されています。`);
    } else if (!checkOverScoreResult['away']) {
      throw new BadRequestError(`アウェイチームの得点者数がアウェイチームの得点数より多く指定されています。`);
    }

    try {
      await client.query("BEGIN");

      const scorerIds: string[] = [];
      for (const scorer of data) {

        // スコアラーのプレイヤーIDは試合のホームかアウェイのプレイヤーでなければおかしい
        if (match.homePlayerId.toString() !== scorer.player_id && match.awayPlayerId.toString() !== scorer.player_id) {
          throw new BadRequestError('試合を行ったユーザーを指定して下さい。');
        }

        // 作成するスコアラーのID
        const scorerId = new ScorerId();

        const newScorer = new Scorer(
          scorerId,
          new ScorerName(scorer.name),
          matchIdObject,
          new PlayerId(scorer.player_id)
        );

        await this.scorerRepository.save(newScorer);
        scorerIds.push(scorerId.toString());
      }
      await client.query("COMMIT");
      return scorerIds;

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  };

  /**
   * 
   * @param scorers 
   * @returns プレイヤーごとの得点者数
   */
  private countScorersByPlayer(scorers: RegisterScorerDTO[]): { [player_id: string]: number } {
    const scorerCountMap: { [player_id: string]: number } = {};
  
    for (const scorer of scorers) {
      if (scorerCountMap[scorer.player_id]) {
        scorerCountMap[scorer.player_id]++;
      } else {
        scorerCountMap[scorer.player_id] = 1;
      }
    }
  
    return scorerCountMap;
  }

  private async checkOverScore(scorers: RegisterScorerDTO[], match: Match): Promise<{ [homeOrAway: string]: boolean}> {
    const scorerCount = this.countScorersByPlayer(scorers);
    const results = await this.scorerRepository.findByMatchId(match.id);

    const checkResult: { [homeOrAway: string]: boolean} = {};

    /**
     * 得点者がホームチームの場合、ホームチームの得点数を得点数が超えない
     * 得点者がアウェイチームの場合、アウェイチームの得点数を得点数が超えない
     */
    if (
      results.filter(result => result.playerId.equals(match.homePlayerId)).length + scorerCount[match.homePlayerId.toString()] > match.homeScore.value
    ) {
      checkResult['home'] = false;
    } else {
      checkResult['home'] = true;
    }

    if (
      results.filter(result => result.playerId.equals(match.awayPlayerId)).length + scorerCount[match.awayPlayerId.toString()] > match.awayScore.value
    ) {
      checkResult['away'] = false;
    } else {
      checkResult['away'] = true;
    }

    return checkResult;
  };
};