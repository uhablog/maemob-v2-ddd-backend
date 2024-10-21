import { Pool } from "pg";
import { IMatchRepository } from "../../domain/repositories/matchRepository";
import { Match } from "../../domain/entities/match";
import { Score } from "../../domain/value-objects/score";

/**
 * 試合のリポジトリ
 */
export class PostgresMatchRepository implements IMatchRepository {
  constructor(private readonly db: Pool){};

  async save(match: Match): Promise<number> {
    try {
      const result = await this.db.query(`
        INSERT INTO matches(
          home_player_id,
          away_player_id,
          home_score,
          away_score
        ) VALUES (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING id, match_date
        ;
      `, [
        match.homePlayerId,
        match.awayPlayerId,
        match.homeScore.value,
        match.awayScore.value
      ]);

      const id: number = result.rows[0].id;
      return id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(): Promise<Match[]> {
    const results = await this.db.query(`
      SELECT
        id
        ,home_player_id
        ,away_player_id
        ,home_score
        ,away_score
        ,match_date
      FROM
        matches;
    `);

    return results.rows.map(row => new Match(
      row.id,
      row.home_player_id,
      row.away_player_id,
      new Score(row.home_score),
      new Score(row.away_score),
      row.match_date
    ));
  }
}