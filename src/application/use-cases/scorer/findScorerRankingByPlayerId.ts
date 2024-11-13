import { Pool } from "pg";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { IScorerRepository } from "../../../domain/repositories/scorerRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ScorerCountDTO } from "../../dto/scorerCountDto";

export class FindScorerRankingByPlayerIdUseCase {

  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly db: Pool
  ) {}

  async execute(
    playerId: number
  ): Promise<ScorerCountDTO[]> {
    const client = await this.db.connect();

    try {
      /**
       * プレイヤーの存在確認
       */
      const player = await this.playerRepository.findById(client, playerId);

      if (player == null) {
        throw new NotFoundError(`player id: ${playerId}`);
      }

      // 得点ランキングの取得
      const results = await this.scorerRepository.findScorerRankingByPlayerId(playerId);

      return results.map( (result) => result.toJSON() as ScorerCountDTO);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
};