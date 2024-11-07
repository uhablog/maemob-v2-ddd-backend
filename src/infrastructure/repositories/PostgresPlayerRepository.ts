import { Pool } from "pg";
import { IPlayerRepository } from "../../domain/repositories/playerRepository";
import { Player } from "../../domain/entities/player";
import { PlayerName } from "../../domain/value-objects/playerName";
import { Points } from "../../domain/value-objects/points";
import { ConventionID } from "../../domain/value-objects/conventionId";

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
          convention_id,
          name,
          points
        ) VALUES (
          $1,
          $2,
          $3
        )
        RETURNING id
      `, [player.convention_id.toString(), player.name.name, player.points.value]);

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
   * @returns 全てのプレイヤーをポイント順で取得
   */
  async findByConventionId(conventionId: string): Promise<Player[]> {
    const result = await this.db.query(`
      SELECT
        id
        ,convention_id
        ,name
        ,points
      FROM
        players
      WHERE
        convention_id = $1
      ORDER BY
        points desc
      ;
    `, [conventionId]);

    return result.rows.map(row => new Player(
      row.id,
      new ConventionID(row.convention_id),
      new PlayerName(row.name),
      new Points(row.points)))
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
          ,convention_id
          ,name
          ,points
        FROM
          players
        WHERE
          id = $1
      `, [ id ]);

      // 1でなければおかしい
      if (result.rowCount !== 1) {
        return null
      }

      return new Player(
        result.rows[0].id,
        new ConventionID(result.rows[0].convention_id),
        new PlayerName(result.rows[0].name),
        new Points(result.rows[0].points)
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
};