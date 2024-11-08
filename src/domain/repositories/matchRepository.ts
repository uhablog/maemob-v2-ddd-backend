import { Match } from "../entities/match";

export interface IMatchRepository {
  save(match: Match): Promise<number>;
  findAll(conventionId: string): Promise<Match[]>;
  findById(id: number): Promise<Match | null>;
}