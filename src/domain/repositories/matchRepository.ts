import { PoolClient } from "pg";
import { Match } from "../entities/match";
import { MatchId } from "../value-objects/matchId";

export interface IMatchRepository {

  /**
   * 試合の登録を行う
   * @param match 登録する試合
   */
  save(client: PoolClient, match: Match): Promise<number>;

  /**
   * 大会IDを指定して取得する
   * @param conventionId 大会ID
   */
  findAll(client: PoolClient, conventionId: string): Promise<Match[]>;

  /**
   * 試合IDを指定して取得する
   * @param id 試合ID
   */
  findById(client: PoolClient, id: MatchId): Promise<Match | null>;
}