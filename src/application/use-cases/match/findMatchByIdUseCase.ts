import { Pool } from "pg";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { MatchDTO } from "../../dto/matchDto";
import { MatchId } from "../../../domain/value-objects/matchId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class FindMatchByIdUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly db: Pool
  ) {}

  async execute(matchId: string): Promise<MatchDTO> {

    const client = await this.db.connect();

    try {
      const match = await this.matchRepository.findById(client, new MatchId(matchId));

      if (match == null) {
        throw new NotFoundError(`match id ${matchId}`);
      }

      return {
        id: match.id.toString(),
        conventionId: match.conventionId.toString(),
        homePlayerId: match.homePlayerId.toString(),
        awayPlayerId: match.awayPlayerId.toString(),
        homeScore: match.homeScore.value,
        awayScore: match.awayScore.value,
        matchDate: match.matchDate.toISOString()
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}