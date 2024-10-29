import { Pool } from "pg";
import { Assist } from "../../domain/entities/assist";
import { IAssistRepository } from "../../domain/repositories/assistRepository";
import { AssistId } from "../../domain/value-objects/assistId";
import { AssistName } from "../../domain/value-objects/assistName";

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
};