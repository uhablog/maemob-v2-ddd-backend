import { PlayerId } from "../value-objects/playerId";
import { PlayerName } from "../value-objects/playerName";
import { ScoreCount } from "../value-objects/scoreCount";
import { ScorerName } from "../value-objects/scorerName";

export class ScorerCount {

  constructor (
    public readonly player_id: PlayerId,
    public readonly player_name: PlayerName,
    public readonly name: ScorerName,
    public readonly scoreCount: ScoreCount
  ) {}

  toJSON(): object {
    return {
      player_id: this.player_id.toString(),
      player_name: this.player_name.name,
      name: this.name.value,
      score_count: this.scoreCount.value
    }
  };
}