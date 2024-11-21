import { MatchId } from "../value-objects/matchId";
import { MomId } from "../value-objects/momId";
import { MomName } from "../value-objects/momName";
import { PlayerId } from "../value-objects/playerId";

export class Mom {

  constructor(
    public readonly id: MomId,
    public readonly name: MomName,
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