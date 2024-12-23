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
import { ResisterScorerDTO } from "../../dto/resisterScorerDto";
import { PlayerId } from "../../../domain/value-objects/playerId";
import { MatchId } from "../../../domain/value-objects/matchId";

export class ResisterScorerUseCase {

  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {};

  async execute(data: ResisterScorerDTO): Promise<string> {

    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(data.convention_id));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${data.convention_id}`);
    }

    const client = await this.db.connect();

    try {

      const matchId = new MatchId(data.match_id);
      
      // playerがmatchしているか判定
      const match = await this.matchRepository.findById(client, matchId);

      if (match == null) {
        throw new NotFoundError(`match id: ${data.match_id}`);
      }

      // スコアラーのプレイヤーIDは試合のホームかアウェイのプレイヤーでなければおかしい
      if (match.homePlayerId.toString() !== data.player_id && match.awayPlayerId.toString() !== data.player_id) {
        throw new BadRequestError('試合を行ったユーザーを指定して下さい。');
      }
      
      // スコアラーは試合の得点数を超えない
      const results = await this.scorerRepository.findByMatchId(matchId);

      /**
       * 得点者がホームチームの場合、ホームチームの得点数を得点数が超えない
       * 得点者がアウェイチームの場合、アウェイチームの得点数を得点数が超えない
       */
      if (
        data.player_id === match.homePlayerId.toString()
        && results.filter(result => result.playerId.equals(match.homePlayerId)).length === match.homeScore.value
      ) {

        throw new BadRequestError(`ホームチームの得点者数が得点数に到達しました。`);

      } else if (
        data.player_id === match.awayPlayerId.toString()
        && results.filter(result => result.playerId.equals(match.awayPlayerId)).length === match.awayScore.value
      ) {

        throw new BadRequestError(`アウェイチームの得点者数が得点数に到達しました。`);

      };

      // 作成するスコアラーのID
      const scorerId = new ScorerId();

      const scorer = new Scorer(
        scorerId,
        new ScorerName(data.name),
        matchId,
        new PlayerId(data.player_id)
      );

      await this.scorerRepository.save(scorer);
      return scorerId.toString();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }

  };
};