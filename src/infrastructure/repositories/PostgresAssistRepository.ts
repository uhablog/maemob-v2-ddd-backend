import { Pool } from "pg";
import { Assist } from "../../domain/entities/assist";
import { IAssistRepository } from "../../domain/repositories/assistRepository";
import { AssistId } from "../../domain/value-objects/assistId";
import { AssistName } from "../../domain/value-objects/assistName";
import { AssistCount } from "../../domain/entities/assistCount";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { PlayerName } from "../../domain/value-objects/playerName";
import { AssistCounts } from "../../domain/value-objects/assistCounts";

export class PostgresAssistRepository implements IAssistRepository {

  constructor(
    private readonly db: Pool
  ) {}

  async save(assist: Assist): Promise<void> {
    const result = await this.db.query(`
      INSERT INTO assists(
        id,
        match_id,
        player_id,
        name
      ) VALUES (
        $1,
        $2,
        $3,
        $4
      );
    `, [
      assist.id.toString(),
      assist.matchId,
      assist.playerId,
      assist.name.value
    ]);
  };

  async findByMatchId(matchId: number): Promise<Assist[]> {
    const results = await this.db.query(`
      SELECT
        id
        ,name
        ,match_id
        ,player_id
      FROM
        assists
      WHERE
        match_id = $1
    `, [ matchId ]);

    return results.rows.map( row => new Assist(
      new AssistId(row.id),
      new AssistName(row.name),
      row.match_id,
      row.player_id
    ));
  };

  async findAssistRankingByConventionId(conventionId: ConventionID): Promise<AssistCount[]> {
    const results = await this.db.query(`
      SELECT 
        a.name AS assist_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(a.id) AS assists
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        assists a ON m.id = a.match_id
      JOIN 
        players p ON a.player_id = p.id
      WHERE 
        c.id = $1
      GROUP BY 
        a.name, p.name, p.id
      ORDER BY 
        assists DESC;
    `, [ conventionId.toString() ]);

    return results.rows.map( row => new AssistCount(
      row.player_id,
      new PlayerName(row.player_name),
      new AssistName(row.assist_name),
      new AssistCounts(Number(row.assists))
    ));
  }

  async findAssistRankingByPlayerId(playerId: number): Promise<AssistCount[]> {
    const results = await this.db.query(`
      SELECT 
        a.name AS assist_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(a.id) AS assists
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        assists a ON m.id = a.match_id
      JOIN 
        players p ON a.player_id = p.id
      WHERE 
        p.id = $1
      GROUP BY 
        a.name, p.name, p.id
      ORDER BY 
        assists DESC;
    `, [ playerId ]);

    return results.rows.map( row => new AssistCount(
      row.player_id,
      new PlayerName(row.player_name),
      new AssistName(row.assist_name),
      new AssistCounts(Number(row.assists))
    ));
  }
};