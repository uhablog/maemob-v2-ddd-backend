import { Pool } from "pg";
import { Player } from "../../../domain/entities/player";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { Concede } from "../../../domain/value-objects/concede";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { Draws } from "../../../domain/value-objects/draws";
import { Goals } from "../../../domain/value-objects/goals";
import { Losses } from "../../../domain/value-objects/losses";
import { PlayerName } from "../../../domain/value-objects/playerName";
import { Points } from "../../../domain/value-objects/points";
import { Wins } from "../../../domain/value-objects/wins";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerDTO } from "../../dto/playerDto";


interface ResisterPlayerDTO {
  name: string
  conventionId: string
}

export class ResisterPlayerUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(data: ResisterPlayerDTO): Promise<PlayerDTO> {
    const client = await this.db.connect();

    try {
      
      const conventionId = new ConventionID(data.conventionId);

      // 大会の存在確認(存在しなければ404 NOT FOUND)
      const convention = await this.conventionRepository.findById(conventionId);

      if (convention == null) {
        throw new NotFoundError(`convention id: ${conventionId.toString()}`);
      }

      const player = new Player(
        null,
        conventionId,
        new PlayerName(data.name),
        new Points(0),
        new Wins(0),
        new Draws(0),
        new Losses(0),
        new Goals(0),
        new Concede(0)
      );
      const id = await this.playerRepository.save(client, player);
      player.setId(id);

      return player.getStats();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }

  }
}