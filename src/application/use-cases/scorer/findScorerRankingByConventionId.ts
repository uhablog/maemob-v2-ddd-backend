import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IScorerRepository } from "../../../domain/repositories/scorerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ScorerCountDTO } from "../../dto/scorerCountDto";

export class FindScorerRankingByConventionIdUseCase {

  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(
    conventionId: string
  ): Promise<ScorerCountDTO[]> {

    /**
     * 大会の存在確認
     */
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    // 得点ランキングの取得
    const results = await this.scorerRepository.findScorerRankingByConventionId(new ConventionID(conventionId));

    return results.map( (result) => result.toJSON() as ScorerCountDTO);
  };
};