import { Scorer } from "../entities/scorer";

export interface IScorerRepository {
  save(scorer: Scorer): Promise<void>;
  findByMatchId(matchId: number): Promise<Scorer[]>;
}