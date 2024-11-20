import { Assist } from "../entities/assist";
import { AssistCount } from "../entities/assistCount";
import { ConventionID } from "../value-objects/conventionId";
import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";

export interface IAssistRepository {
  save(assist: Assist): Promise<void>;
  findByMatchId(matchId: MatchId): Promise<Assist[]>;
  findAssistRankingByConventionId(conventionId: ConventionID): Promise<AssistCount[]>;
  findAssistRankingByPlayerId(playerId: PlayerId): Promise<AssistCount[]>;
}