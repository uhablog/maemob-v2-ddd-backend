import { isValidUUID } from "../../shared/common/ValidUUID";
import { AssistId } from "../value-objects/assistId";
import { AssistName } from "../value-objects/assistName";
import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";

export class Assist {

  constructor(
    public readonly id: AssistId,
    public readonly name: AssistName,
    public readonly matchId: MatchId,
    public readonly playerId: PlayerId,
  ) {}

  toJSON(): object {
    return {
      id: this.id.toString(),
      name: this.name.value,
      match_id: this.matchId.toString(),
      player_id: this.playerId.toString(),
    };
  }
}