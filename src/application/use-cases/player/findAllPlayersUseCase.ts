import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { PlayerDTO } from "../../dto/playerDto";

export class FindAllPlayersUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(): Promise<PlayerDTO[]> {
    try {
      const results = await this.playerRepository.findAll();
      return results.map((result) => ({
        id: result.id,
        name: result.name.name,
        points: result.points.value
      }));
    } catch (error) {
      console.error("Error Find All Users: ", error);
      throw new Error("Faild to findAllPlayers");
    }
  }
}