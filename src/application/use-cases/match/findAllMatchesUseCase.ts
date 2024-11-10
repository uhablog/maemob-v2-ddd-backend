import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { MatchDTO } from "../../dto/matchDto";

export class FindAllMatchesUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(conventionId: string): Promise<MatchDTO[]>{

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const results = await this.matchRepository.findAll(conventionId);
    return results.map((result) => ({
      id: result.id as number,
      conventionId: result.conventionId.toString(),
      homePlayerId: result.homePlayerId,
      awayPlayerId: result.awayPlayerId,
      homeScore: result.homeScore.value,
      awayScore: result.awayScore.value,
      matchDate: result.matchDate.toISOString()
    }))
  };
}