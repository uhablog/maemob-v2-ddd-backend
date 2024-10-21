import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { MatchDTO } from "../../dto/matchDto";

export class FindAllMatchesUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async execute(): Promise<MatchDTO[]>{
    try {
      const results = await this.matchRepository.findAll();
      return results.map((result) => ({
        id: result.id,
        homePlayerId: result.homePlayerId,
        awayPlayerId: result.awayPlayerId,
        homeScore: result.homeScore.value,
        awayScore: result.awayScore.value,
        matchDate: result.matchDate.toISOString()
      }))
    } catch (error) {
      console.error("Error Find All Matches: ", error);
      throw new Error("Faild to findAllMatches");
    }
  };
}