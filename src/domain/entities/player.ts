import { PlayerName } from "../value-objects/playerName";
import { Points } from "../value-objects/points";

export class Player {

  constructor(
    public readonly id: number,
    public readonly name: PlayerName,
    private _points: Points = new Points(0)
  ) {}

  get points(): Points {
    return this._points;
  }

  add1Points(): void {
    this._points = this._points.add1Points();
  }

  add3Points(): void {
    this._points = this._points.add3Points();
  }
}