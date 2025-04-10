import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { IScorerRepository } from "../../../domain/repositories/scorerRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ScorerDTO } from "../../dto/scorerDto";
import { MatchId } from "../../../domain/value-objects/matchId";

export class FindScorerByMatchIdUseCase {
  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(conventionId: string, matchId: string): Promise<ScorerDTO[]> {
    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    try {

      const matchIdVO = new MatchId(matchId);
      // 試合の存在確認
      const match = await this.matchRepository.findById(client, matchIdVO);

      if (match == null) {
        throw new NotFoundError(`match id: ${matchId}`);
      };

      const results = await this.scorerRepository.findByMatchId(matchIdVO);

      return results.map((result) => result.toJSON() as ScorerDTO);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }

  };
}
