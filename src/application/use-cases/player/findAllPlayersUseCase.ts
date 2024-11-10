import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerDTO } from "../../dto/playerDto";

export class FindAllPlayersUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(conventionId: string): Promise<PlayerDTO[]> {

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    // 大会に紐づいたプレイヤーの取得
    const client = await this.db.connect();
    try {
      const players = await this.playerRepository.findByConventionId(client, conventionId);
      return players.map((player) => player.getStats());
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}