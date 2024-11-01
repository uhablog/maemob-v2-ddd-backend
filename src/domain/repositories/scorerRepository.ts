import { Scorer } from "../entities/scorer";
import { ScorerCount } from "../entities/scorerCount";
import { ConventionID } from "../value-objects/conventionId";

export interface IScorerRepository {
  save(scorer: Scorer): Promise<void>;
  findByMatchId(matchId: number): Promise<Scorer[]>;
  findScorerRankingByConventionId(conventionId: ConventionID): Promise<ScorerCount[]>;
}