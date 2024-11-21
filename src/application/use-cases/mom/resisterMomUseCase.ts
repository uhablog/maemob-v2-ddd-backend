import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerId } from "../../../domain/value-objects/playerId";
import { MatchId } from "../../../domain/value-objects/matchId";
import { IMomRepository } from "../../../domain/repositories/momRepository";
import { ResisterMomDTO } from "../../dto/resisterMomDto";
import { MomId } from "../../../domain/value-objects/momId";
import { Mom } from "../../../domain/entities/mom";
import { MomName } from "../../../domain/value-objects/momName";

export class ResisterMomUseCase {

  constructor(
    private readonly momRepository: IMomRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {};

  async execute(data: ResisterMomDTO): Promise<string> {

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

      // MOMのプレイヤーIDは試合のホームかアウェイのプレイヤーでなければおかしい
      if (match.homePlayerId.toString() !== data.player_id && match.awayPlayerId.toString() !== data.player_id) {
        throw new BadRequestError('試合を行ったユーザーを指定して下さい。');
      }
      
      // MOM数は試合の得点数を超えない
      const result = await this.momRepository.findByMatchId(matchId);

      if (result !== null) {
        throw new BadRequestError(`すでにMOMは登録されています。`);
      }

      // MOMの登録を行う
      const momId = new MomId();

      const mom = new Mom(
        momId,
        new MomName(data.name),
        matchId,
        new PlayerId(data.player_id)
      );

      await this.momRepository.save(mom);
      return momId.toString();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
};