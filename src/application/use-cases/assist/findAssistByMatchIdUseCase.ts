import { Pool } from "pg";
import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AssistDTO } from "../../dto/assistDto";

export class FindAssistByMatchIdUseCase {
  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  async execute(conventionId: string, matchId: number): Promise<AssistDTO[]> {
    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    try {
      
      // 試合の存在確認
      const match = await this.matchRepository.findById(client, matchId);

      if (match == null) {
        throw new NotFoundError(`match id: ${matchId}`);
      };

      const results = await this.assistRepository.findByMatchId(matchId);

      return results.map((result) => result.toJSON() as AssistDTO);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}
