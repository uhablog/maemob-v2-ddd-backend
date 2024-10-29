import { Pool } from "pg";
import { IScorerRepository } from "../../domain/repositories/scorerRepository";
import { Scorer } from "../../domain/entities/scorer";
import { ScorerName } from "../../domain/value-objects/scorerName";
import { ScorerId } from "../../domain/value-objects/scorerId";

export class PostgresScorerRepository implements IScorerRepository {

  constructor(
    private readonly db: Pool
  ) {}

  async save(scorer: Scorer): Promise<void> {
    const result = await this.db.query(`
      INSERT INTO scorers(
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
      scorer.id.toString(),
      scorer.matchId,
      scorer.playerId,
      scorer.name.value
    ]);
  };

  async findByMatchId(matchId: number): Promise<Scorer[]> {
    const results = await this.db.query(`
      SELECT
        id
        ,name
        ,match_id
        ,player_id
      FROM
        scorers
      WHERE
        match_id = $1
    `, [ matchId ]);

    return results.rows.map( row => new Scorer(
      new ScorerId(row.id),
      new ScorerName(row.name),
      row.match_id,
      row.player_id
    ));
  };
};