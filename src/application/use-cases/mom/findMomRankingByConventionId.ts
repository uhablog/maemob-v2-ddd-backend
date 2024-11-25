import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMomRepository } from "../../../domain/repositories/momRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { MomCountDTO } from "../../dto/momCountDto";

export class FindMomRankingByConventionIdUseCase {

  constructor(
    private readonly momRepository: IMomRepository,
    private readonly conventionRepository: IConventionRepository
  ) {}

  async execute(
    conventionId: string
  ): Promise<MomCountDTO[]> {

    /**
     * 大会の存在確認
     */
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    // MOMランキングの取得
    const results = await this.momRepository.findMomRankingByConventionId(new ConventionID(conventionId));

    return results.map( (result) => result.toJSON() as MomCountDTO);
  };
};