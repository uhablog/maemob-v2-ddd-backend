import { ConventionID } from "../value-objects/conventionId";
import { Score } from "../value-objects/score";

export class Match {

  constructor(
    private readonly _id: number,
    private readonly _conventionId: ConventionID,
    private readonly _homePlayerId: number,
    private readonly _awayPlayerId: number,
    private readonly _homeScore: Score,
    private readonly _awayScore: Score,
    private readonly _matchDate: Date
  ){}

  get id(): number {
    return this._id;
  }

  get conventionId(): ConventionID {
    return this._conventionId;
  };

  get homePlayerId(): number {
    return this._homePlayerId;
  }

  get awayPlayerId(): number {
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