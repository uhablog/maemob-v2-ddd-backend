import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";
import { ScorerId } from "../value-objects/scorerId";
import { ScorerName } from "../value-objects/scorerName";

export class Scorer {

  constructor(
    public readonly id: ScorerId,
    public readonly name: ScorerName,
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