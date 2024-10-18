import { Pool } from "pg";
import { IPlayerRepository } from "../../domain/repositories/playerRepository";
import { Player } from "../../domain/entities/player";
import { PlayerName } from "../../domain/value-objects/playerName";
import { Points } from "../../domain/value-objects/points";

export class PostgresPlayerRepository implements IPlayerRepository {
  constructor(private db: Pool){}

  async save(player: Player): Promise<void>{
    try {
      await this.db.query(`
        INSERT INTO players(
          name,
          points
        ) VALUES (
          $1,
          $2
        )
      `, [player.name.name, player.points.value]);
    } catch (error) {
      console.log(error);
    }
  }

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
};