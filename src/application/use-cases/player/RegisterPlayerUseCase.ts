import { Player } from "../../../domain/entities/player";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { PlayerName } from "../../../domain/value-objects/playerName";
import { Points } from "../../../domain/value-objects/points";

interface ResisterPlayerDTO {
  name: string
}

export class ResisterPlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(data: ResisterPlayerDTO): Promise<number> {
    const player = new Player(1, new PlayerName(data.name), new Points(0));
    return await this.playerRepository.save(player);
  }
}