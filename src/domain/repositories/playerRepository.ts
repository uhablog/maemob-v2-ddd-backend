import { PoolClient } from "pg";
import { Player } from "../entities/player";
import { Points } from "../value-objects/points";

export interface IPlayerRepository {
  /**
   * プレイヤーの保存(登録・更新)を行う
   * @param player 保存(登録・更新)するプレイヤー
   */
  save(client: PoolClient, player: Player): Promise<number>;

  /**
   * ポイントを更新する
   * @param id プレイヤーID 
   * @param points 更新後のポイント
   */
  updatePoints(client: PoolClient, id: number, points: Points): Promise<void>;

  /**
   * 大会に参加しているプレイヤーを取得する
   * @param conventionId 大会ID
   */
  findByConventionId(client: PoolClient, conventionId: string): Promise<Player[]>;

  /**
   * プレイヤーIdで特定のプレイヤーを取得する
   * @param id プレイヤーID
   */
  findById(client: PoolClient, id: number): Promise<Player | null>;
}