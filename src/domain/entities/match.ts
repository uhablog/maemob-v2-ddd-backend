import { ConventionID } from "../value-objects/conventionId";
import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";
import { Score } from "../value-objects/score";

export class Match {

  constructor(
    private readonly _id: MatchId,
    private readonly _conventionId: ConventionID,
    private readonly _homePlayerId: PlayerId,
    private readonly _awayPlayerId: PlayerId,
    private readonly _homeScore: Score,
    private readonly _awayScore: Score,
    private readonly _matchDate: Date
  ){}

  get id(): MatchId {
    return this._id;
  }

  get conventionId(): ConventionID {
    return this._conventionId;
  };

  get homePlayerId(): PlayerId {
    return this._homePlayerId;
  }

  get awayPlayerId(): PlayerId {
    return this._awayPlayerId;
  }

  get homeScore(): Score {
    return this._homeScore;
  }

  get awayScore(): Score {
    return this._awayScore;
  }

  get matchDate(): Date {
    return this._matchDate;
  }

  /**
   * 試合の勝者を取得する
   * home | away | draw
   * @returns 勝者(home or away or draw)
   */
  getWinner(): string {
    if (this._homeScore.value > this._awayScore.value) {
      return "home";
    } else if (this._awayScore.value > this._homeScore.value) {
      return "away";
    }

    return "draw";
  }

}