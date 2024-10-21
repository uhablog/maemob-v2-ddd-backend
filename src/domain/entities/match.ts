import { Points } from "../value-objects/points";
import { Score } from "../value-objects/score";

export class Match {

  constructor(
    private readonly _id: number,
    private readonly _homePlayerId: number,
    private readonly _awayPlayerId: number,
    private readonly _homeScore: Score,
    private readonly _awayScore: Score,
    private readonly _matchDate: Date
  ){}

  get id(): number {
    return this._id;
  }

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

}