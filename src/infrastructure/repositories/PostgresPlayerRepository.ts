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
import { PlayerId } from "../../domain/value-objects/playerId";

export class PostgresPlayerRepository implements IPlayerRepository {
  constructor(){}

  /**
   * 
   * プレイヤーの保存を行う
   * @param client DBクライアント 
   * @param player 保存するプレイヤー
   * @returns プレイヤーID
   */
  async save(client: PoolClient, player: Player): Promise<string>{
    try {
      const playerStats = player.getStats();
      const inputValues = [
        playerStats.id,
        playerStats.convention_id,
        playerStats.name,
        playerStats.points,
        playerStats.wins,
        playerStats.draws,
        playerStats.losses,
        playerStats.goals,
        playerStats.concede,
      ];

      // idが存在しているかチェックして存在していればUpdate、存在していなければInsertを行う
      let dbPlayer: Player | null = null;
      dbPlayer = await this.findById(client, new PlayerId(playerStats.id));

      if (dbPlayer === null) {

        const result = await client.query(`
          INSERT INTO players (
            id,
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
            $8,
            $9
          )
          RETURNING id
        `, inputValues);

        return result.rows[0].id;
      } else {

        await client.query(`
          UPDATE
            players
          SET
            convention_id = $2,
            name = $3,
            points = $4,
            wins = $5,
            draws = $6,
            losses = $7,
            goals = $8,
            concede = $9
          WHERE
            id = $1
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
  async updatePoints(client: PoolClient, id: PlayerId, points: Points): Promise<void> {
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
        id.toString()
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
      new PlayerId(row.id),
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
  async findById(client: PoolClient, id: PlayerId): Promise<Player | null> {
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
      `, [ id.toString() ]);

      // 1でなければおかしい
      if (result.rowCount !== 1) {
        return null
      }

      return new Player(
        new PlayerId(result.rows[0].id),
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