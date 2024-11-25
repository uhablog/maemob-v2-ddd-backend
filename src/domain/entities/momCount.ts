import { MomCounts } from "../value-objects/momCounts";
import { MomName } from "../value-objects/momName";
import { PlayerId } from "../value-objects/playerId";
import { PlayerName } from "../value-objects/playerName";

export class MomCount {

  constructor (
    public readonly player_id: PlayerId,
    public readonly player_name: PlayerName,
    public readonly name: MomName,
    public readonly mom_count: MomCounts
  ) {}

  equals(other: MomCount): boolean {
    return (
      this.player_id.toString() === other.player_id.toString()
      && this.player_name.equals(other.player_name)
      && this.name.equals(other.name)
      && this.mom_count.equals(other.mom_count)
    )
  }

  toJSON(): object {
    return {
      player_id: this.player_id.toString(),
      player_name: this.player_name.name,
      name: this.name.value,
      mom_count: this.mom_count.value
    }
  };
}