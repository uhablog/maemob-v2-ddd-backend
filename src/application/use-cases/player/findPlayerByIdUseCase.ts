import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerDTO } from "../../dto/playerDto";

export class FindPlayerByIdUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(conventionId: string, id: number): Promise<PlayerDTO> {

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const player = await this.playerRepository.findById(id);

    if (player == null) {
      throw new NotFoundError(`player id ${id}`);
    }

    return {
      id: player.id,
      name: player.name.name,
      points: player.points.value
    }
  };
};