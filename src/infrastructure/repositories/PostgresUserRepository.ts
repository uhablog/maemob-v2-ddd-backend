import { Pool } from "pg";
import { IPlayerRepository } from "../../domain/repositories/playerRepository";
import { Player } from "../../domain/entities/player";
import { PlayerName } from "../../domain/value-objects/playerName";
import { Points } from "../../domain/value-objects/points";

export class PostgresPlayerRepository implements IPlayerRepository {
  constructor(private db: Pool){}

  /**
   * プレイヤーの登録を行う
   * @param player 登録するプレイヤー
   */
  async save(player: Player): Promise<number>{
    try {
      const result = await this.db.query(`
        INSERT INTO players(
          name,
          points
        ) VALUES (
          $1,
          $2
        )
        RETURNING id
      `, [player.name.name, player.points.value]);

      const id: number = result.rows[0].id;
      return id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * ポイントの追加を行う
   * @param id ポイント変更するユーザーID
   * @param points 追加するポイント
   */
  async updatePoints(id: number, points: Points): Promise<void> {
    try {
      await this.db.query(`
        UPDATE
          players
        SET
          points = $1
        WHERE
          id = $2
      ;`, [
        points.value,
        id
      ]);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * プレイヤーの取得を行う
   * @returns 全てのプレイヤーを取得
   */
  async findAll(): Promise<Player[]> {
    const result = await this.db.query(`
      SELECT
        id
        ,name
        ,points
      FROM
        players;
    `);

    return result.rows.map(row => new Player(row.id, new PlayerName(row.name), new Points(row.points)))
  }

  /**
   * IDを指定してユーザーを取得
   * @param player 取得するユーザー
   * @returns 取得結果
   */
  async findById(id: number): Promise<Player | null> {
    try {
      const result = await this.db.query(`
        SELECT
          id
          ,name
          ,points
        FROM
          players
        WHERE
          id = $1
      `, [id]);

      // 1でなければおかしい
      if (result.rowCount !== 1) {
        return null
      }

      return new Player(
        result.rows[0].id,
        new PlayerName(result.rows[0].name),
        new Points(result.rows[0].points)
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};