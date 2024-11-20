import { Scorer } from "../entities/scorer";
import { ScorerCount } from "../entities/scorerCount";
import { ConventionID } from "../value-objects/conventionId";
import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";

export interface IScorerRepository {
  save(scorer: Scorer): Promise<void>;
  findByMatchId(matchId: MatchId): Promise<Scorer[]>;
  findScorerRankingByConventionId(conventionId: ConventionID): Promise<ScorerCount[]>;
  findScorerRankingByPlayerId(playerId: PlayerId): Promise<ScorerCount[]>;
}