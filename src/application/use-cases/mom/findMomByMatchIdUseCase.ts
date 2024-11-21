import { Pool } from "pg";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { MatchId } from "../../../domain/value-objects/matchId";
import { IMomRepository } from "../../../domain/repositories/momRepository";
import { MomDTO } from "../../dto/momDto";

export class FindMomByMatchIdUseCase {
  constructor(
    private readonly momRepository: IMomRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {}

  /**
   * 指定されたMatchIdでMOMを取得する
   * @param conventionId 大会ID
   * @param matchId 試合ID
   * @returns 該当試合のMOM
   */
  async execute(conventionId: string, matchId: string): Promise<MomDTO> {
    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    try {

      const matchIdValueObject = new MatchId(matchId);
      
      // 試合の存在確認
      const match = await this.matchRepository.findById(client, matchIdValueObject);

      if (match == null) {
        throw new NotFoundError(`match id: ${matchId}`);
      };

      const result = await this.momRepository.findByMatchId(matchIdValueObject);

      if (result === null) {
        throw new NotFoundError(`MOM`);
      }

      return result.toJSON() as MomDTO;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  };
}
