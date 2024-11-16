import { Pool } from "pg";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { AssistCountDTO } from "../../dto/assistCountDto";
import { PlayerId } from "../../../domain/value-objects/playerId";

export class FindAssistRankingByPlayerIdUseCase {

  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly db: Pool
  ) {}

  async execute(
    playerId: string
  ): Promise<AssistCountDTO[]> {
    const client = await this.db.connect();

    try {
      /**
       * プレイヤーの存在確認
       */
      const player = await this.playerRepository.findById(client, new PlayerId(playerId));

      if (player == null) {
        throw new NotFoundError(`player id: ${playerId}`);
      }

      // アシストランキングの取得
      const results = await this.assistRepository.findAssistRankingByPlayerId(new PlayerId(playerId));

      return results.map( (result) => result.toJSON() as AssistCountDTO);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
};