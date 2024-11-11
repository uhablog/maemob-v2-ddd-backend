import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class FindAssistRankingByConventionIdUseCase {

  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(
    conventionId: string
  ): Promise<AssistCountDTO[]> {

    /**
     * 大会の存在確認
     */
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    // アシストランキングの取得
    const results = await this.assistRepository.findAssistRankingByConventionId(new ConventionID(conventionId));

    return results.map( (result) => result.toJSON() as AssistCountDTO);
  };
};