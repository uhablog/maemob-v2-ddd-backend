import { Match } from "../entities/match";

export interface IMatchRepository {
  save(match: Match): Promise<void>;
  findAll(): Promise<Match[]>;
}