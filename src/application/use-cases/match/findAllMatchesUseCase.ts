import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { MatchDTO } from "../../dto/matchDto";

export class FindAllMatchesUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(conventionId: string): Promise<MatchDTO[]>{

    // 大会の存在確認(存在しなければ404 NOT FOUND)
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    try {
      const results = await this.matchRepository.findAll(client, conventionId);
      return results.map((result) => ({
        id: result.id.toString(),
        conventionId: result.conventionId.toString(),
        homePlayerId: result.homePlayerId.toString(),
        awayPlayerId: result.awayPlayerId.toString(),
        homeScore: result.homeScore.value,
        awayScore: result.awayScore.value,
        matchDate: result.matchDate.toISOString()
      }));
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}