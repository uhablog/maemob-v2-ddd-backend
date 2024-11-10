import { Pool, PoolClient } from "pg";
import { IPlayerRepository } from "../../domain/repositories/playerRepository";
import { Player } from "../../domain/entities/player";
import { PlayerName } from "../../domain/value-objects/playerName";
import { Points } from "../../domain/value-objects/points";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { Wins } from "../../domain/value-objects/wins";
import { Draws } from "../../domain/value-objects/draws";
import { Losses } from "../../domain/value-objects/losses";
import { Goals } from "../../domain/value-objects/goals";
import { Concede } from "../../domain/value-objects/concede";

export class PostgresPlayerRepository implements IPlayerRepository {
  constructor(){}

  /**
   * 
   * プレイヤーの保存を行う
   * @param client DBクライアント 
   * @param player 保存するプレイヤー
   * @returns プレイヤーID
   */
  async save(client: PoolClient, player: Player): Promise<number>{
    try {
      const playerStats = player.getStats();
      const inputValues = [
        playerStats.convention_id,
        playerStats.name,
        playerStats.points,
        playerStats.wins,
        playerStats.draws,
        playerStats.losses,
        playerStats.goals,
        playerStats.concede,
        playerStats.id
      ];

      // idが存在しているかチェックして存在していればUpdate、存在していなければInsertを行う
      let dbPlayer: Player | null = null;
      if (playerStats.id !== null) {
        dbPlayer = await this.findById(client, playerStats.id);
      }

      if (dbPlayer === null || playerStats.id === null) {

        const result = await client.query(`
          INSERT INTO players (
            convention_id,
            name,
            points,
            wins,
            draws,
            losses,
            goals,
            concede
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )
          RETURNING id
        `, inputValues.slice(0, -1));

        return result.rows[0].id;
      } else {

        await client.query(`
          UPDATE
            players
          SET
            convention_id = $1,
            name = $2,
            points = $3,
            wins = $4,
            draws = $5,
            losses = $6,
            goals = $7,
            concede = $8
          WHERE
            id = $9
        `, inputValues);

        return playerStats.id;
      }
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
  async updatePoints(client: PoolClient, id: number, points: Points): Promise<void> {
    try {
      await client.query(`
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
  async findByConventionId(client: PoolClient, conventionId: string): Promise<Player[]> {
    const result = await client.query(`
      SELECT
        id
        ,convention_id
        ,name
        ,points
        ,wins
        ,draws
        ,losses
        ,goals
        ,concede
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
      new Points(row.points),
      new Wins(row.wins),
      new Draws(row.draws),
      new Losses(row.losses),
      new Goals(row.goals),
      new Concede(row.concede))
    );
  }

  /**
   * IDを指定してユーザーを取得
   * @param player 取得するユーザー
   * @returns 取得結果
   */
  async findById(client: PoolClient, id: number): Promise<Player | null> {
    try {
      const result = await client.query(`
        SELECT
          id
          ,convention_id
          ,name
          ,points
          ,wins
          ,draws
          ,losses
          ,goals
          ,concede
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
        new Points(result.rows[0].points),
        new Wins(result.rows[0].wins),
        new Draws(result.rows[0].draws),
        new Losses(result.rows[0].losses),
        new Goals(result.rows[0].goals),
        new Concede(result.rows[0].concede),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
};