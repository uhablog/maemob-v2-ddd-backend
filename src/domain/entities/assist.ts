import { AssistId } from "../value-objects/assistId";
import { AssistName } from "../value-objects/assistName";

export class Assist {

  constructor(
    public readonly id: AssistId,
    public readonly name: AssistName,
    public readonly matchId: number,
    public readonly playerId: number,
  ) {
    if (matchId <= 0) {
      throw new Error("Match ID must be greater than 0");
    }
    if (playerId <= 0) {
      throw new Error("Player ID must be greater than 0");
    }
  }

  toJSON(): object {
    return {
      id: this.id.toString(),
      name: this.name.value,
      match_id: this.matchId,
      player_id: this.playerId,
    };
  }
}