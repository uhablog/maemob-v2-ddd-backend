import { Score } from "../value-objects/score";

export class Match {

  constructor(
    private readonly id: number,
    private readonly homePlayerId: number,
    private readonly awayPlayerId: number,
    private readonly homeScore: Score,
    private readonly awayScore: Score,
    private readonly matchDate: Date
  ){}
}