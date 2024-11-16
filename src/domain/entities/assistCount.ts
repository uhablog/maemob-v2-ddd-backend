import { AssistCounts } from "../value-objects/assistCounts";
import { AssistName } from "../value-objects/assistName";
import { PlayerId } from "../value-objects/playerId";
import { PlayerName } from "../value-objects/playerName";

export class AssistCount {

  constructor (
    public readonly player_id: PlayerId,
    public readonly player_name: PlayerName,
    public readonly name: AssistName,
    public readonly assist_count: AssistCounts
  ) {}

  equals(other: AssistCount): boolean {
    return (
      this.player_id.toString() === other.player_id.toString()
      && this.player_name.equals(other.player_name)
      && this.name.equals(other.name)
      && this.assist_count.equals(other.assist_count)
    )
  }

  toJSON(): object {
    return {
      player_id: this.player_id.toString(),
      player_name: this.player_name.name,
      name: this.name.value,
      assist_count: this.assist_count.value
    }
  };
}