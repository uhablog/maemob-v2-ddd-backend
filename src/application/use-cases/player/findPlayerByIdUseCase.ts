import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerDTO } from "../../dto/playerDto";
import { FindConventionByIdUseCase } from "../convention/findConventionByIdUseCase";

export class FindPlayerByIdUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(conventionId: string, id: number): Promise<PlayerDTO> {

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    try {
      
      const player = await this.playerRepository.findById(client, id);

      if (player == null) {
        throw new NotFoundError(`player id ${id}`);
      }

      return player.getStats();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
};