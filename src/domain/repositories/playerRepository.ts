import { Player } from "../entities/player";
import { Points } from "../value-objects/points";

export interface IPlayerRepository {
  /**
   * プレイヤーの登録を行う
   * @param player 登録するプレイヤー
   */
  save(player: Player): Promise<number>;

  /**
   * ポイントを更新する
   * @param id プレイヤーID 
   * @param points 更新後のポイント
   */
  updatePoints(id: number, points: Points): Promise<void>;

  /**
   * 大会に参加しているプレイヤーを取得する
   * @param conventionId 大会ID
   */
  findByConventionId(conventionId: string): Promise<Player[]>;

  /**
   * プレイヤーIdで特定のプレイヤーを取得する
   * @param id プレイヤーID
   */
  findById(id: number): Promise<Player | null>;
}