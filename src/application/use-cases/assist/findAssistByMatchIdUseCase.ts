import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class FindAssistByMatchIdUseCase {
  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(conventionId: string, matchId: number): Promise<AssistDTO[]> {
    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    // 試合の存在確認
    const match = await this.matchRepository.findById(matchId);

    if (match == null) {
      throw new NotFoundError(`match id: ${matchId}`);
    };

    const results = await this.assistRepository.findByMatchId(matchId);

    return results.map((result) => result.toJSON() as AssistDTO);
  };
}
