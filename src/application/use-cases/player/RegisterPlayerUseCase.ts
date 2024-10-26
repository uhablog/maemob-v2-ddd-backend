import { Player } from "../../../domain/entities/player";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { PlayerName } from "../../../domain/value-objects/playerName";
import { Points } from "../../../domain/value-objects/points";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

interface ResisterPlayerDTO {
  name: string
  conventionId: string
}

export class ResisterPlayerUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(data: ResisterPlayerDTO): Promise<number> {

    const conventionId = new ConventionID(data.conventionId);

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(conventionId);

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId.toString()}`);
    }

    const player = new Player(
      1,
      conventionId,
      new PlayerName(data.name),
      new Points(0)
    );
    return await this.playerRepository.save(player);
  }
}