import { Pool, PoolClient } from "pg";
import { IMatchRepository } from "../../domain/repositories/matchRepository";
import { Match } from "../../domain/entities/match";
import { Score } from "../../domain/value-objects/score";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { PlayerId } from "../../domain/value-objects/playerId";
import { MatchId } from "../../domain/value-objects/matchId";

/**
 * 試合のリポジトリ
 */
export class PostgresMatchRepository implements IMatchRepository {
  constructor(){}
  
  async save(client: PoolClient, match: Match): Promise<number> {
    try {
      const result = await client.query(`
        INSERT INTO matches(
          id,
          convention_id,
          home_player_id,
          away_player_id,
          home_score,
          away_score
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING id, match_date
        ;
      `, [
        match.id.toString(),
        match.conventionId.toString(),
        match.homePlayerId.toString(),
        match.awayPlayerId.toString(),
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

  async findAll(client: PoolClient, conventionId: string): Promise<Match[]> {
    const results = await client.query(`
      SELECT
        id
        ,convention_id
        ,home_player_id
        ,away_player_id
        ,home_score
        ,away_score
        ,match_date
      FROM
        matches
      WHERE
        convention_id = $1
    `, [conventionId]);

    return results.rows.map(row => new Match(
      new MatchId(row.id),
      new ConventionID(row.convention_id),
      new PlayerId(row.home_player_id),
      new PlayerId(row.away_player_id),
      new Score(row.home_score),
      new Score(row.away_score),
      row.match_date
    ));
  }

  async findById(client: PoolClient, id: MatchId): Promise<Match | null> {
    const result = await client.query(`
      SELECT
        id
        ,convention_id
        ,home_player_id
        ,away_player_id
        ,home_score
        ,away_score
        ,match_date
      FROM
        matches
      WHERE
        id = $1
    `, [ id.toString() ]);

    // 取得数が1でない場合
    if (result.rowCount !== 1) {
      return null;
    }

    return new Match(
      new MatchId(result.rows[0].id),
      new ConventionID(result.rows[0].convention_id),
      new PlayerId(result.rows[0].home_player_id),
      new PlayerId(result.rows[0].away_player_id),
      new Score(result.rows[0].home_score),
      new Score(result.rows[0].away_score),
      result.rows[0].match_date
    );
  };

}