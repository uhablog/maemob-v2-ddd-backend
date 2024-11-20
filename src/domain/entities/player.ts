import { Concede } from "../value-objects/concede";
import { ConventionID } from "../value-objects/conventionId";
import { Draws } from "../value-objects/draws";
import { Goals } from "../value-objects/goals";
import { Losses } from "../value-objects/losses";
import { PlayerId } from "../value-objects/playerId";
import { PlayerName } from "../value-objects/playerName";
import { Points } from "../value-objects/points";
import { Wins } from "../value-objects/wins";

export class Player {

  constructor(
    private _id: PlayerId,
    public readonly convention_id: ConventionID,
    public readonly name: PlayerName,
    private _points: Points = new Points(0),
    private _wins: Wins = new Wins(0),
    private _draws: Draws = new Draws(0),
    private _losses: Losses = new Losses(0),
    private _goals: Goals = new Goals(0),
    private _concede: Concede = new Concede(0),
  ) {}

  get id(): PlayerId {
    return this._id;
  }

  get points(): Points {
    return this._points;
  }

  recordWins(): void {
    this._points = this._points.add3Points();
    this._wins = this._wins.increment();
  }

  recordDraws(): void {
    this._points = this._points.add1Points();
    this._draws = this._draws.increment();
  }

  recordLosses(): void {
    this._losses = this._losses.increment();
  }

  addGoals(scoredGoals: number): void {
    this._goals = this._goals.addGoals(scoredGoals);
  }

  addConcede(concede: number): void {
    this._concede = this._concede.addConcede(concede);
  }

  getStats() {
    return {
      id: this._id.toString(),
      convention_id: this.convention_id.toString(),
      name: this.name.name,
      points: this._points.value,
      wins: this._wins.value,
      draws: this._draws.value,
      losses: this._losses.value,
      goals: this._goals.value,
      concede: this._concede.value,
    }
  }
}