import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { PlayerDTO } from "../../dto/playerDto";

export class FindPlayerByIdUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(id: number): Promise<PlayerDTO> {
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