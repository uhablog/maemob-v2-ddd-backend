import { Assist } from "../entities/assist";
import { AssistCount } from "../entities/assistCount";
import { ConventionID } from "../value-objects/conventionId";

export interface IAssistRepository {
  save(assist: Assist): Promise<void>;
  findByMatchId(matchId: number): Promise<Assist[]>;
  findAssistRankingByConventionId(conventionId: ConventionID): Promise<AssistCount[]>;
  findAssistRankingByPlayerId(playerId: number): Promise<AssistCount[]>;
}