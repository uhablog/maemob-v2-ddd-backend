import { Pool } from "pg";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerId } from "../../../domain/value-objects/playerId";
import { IMomRepository } from "../../../domain/repositories/momRepository";
import { MomCountDTO } from "../../dto/momCountDto";

export class FindMomRankingByPlayerIdUseCase {

  constructor(
    private readonly momRepository: IMomRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly db: Pool
  ) {}

  async execute(
    playerId: string
  ): Promise<MomCountDTO[]> {
    const client = await this.db.connect();

    try {
      /**
       * プレイヤーの存在確認
       */
      const player = await this.playerRepository.findById(client, new PlayerId(playerId));

      if (player == null) {
        throw new NotFoundError(`player id: ${playerId}`);
      }

      // MOMランキングの取得
      const results = await this.momRepository.findMomRankingByPlayerId(new PlayerId(playerId));

      return results.map( (result) => result.toJSON() as MomCountDTO);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
};