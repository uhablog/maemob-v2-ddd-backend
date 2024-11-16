import { PlayerId } from "../value-objects/playerId";
import { ScorerId } from "../value-objects/scorerId";
import { ScorerName } from "../value-objects/scorerName";

export class Scorer {

  constructor(
    public readonly id: ScorerId,
    public readonly name: ScorerName,
    public readonly matchId: number,
    public readonly playerId: PlayerId,
  ) {
    if (matchId <= 0) {
      throw new Error("Match ID must be greater than 0");
    }
  }

  toJSON(): object {
    return {
      id: this.id.toString(),
      name: this.name.value,
      match_id: this.matchId,
      player_id: this.playerId.toString(),
    };
  }
}