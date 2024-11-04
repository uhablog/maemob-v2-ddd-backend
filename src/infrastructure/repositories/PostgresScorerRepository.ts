import { Pool } from "pg";
import { IScorerRepository } from "../../domain/repositories/scorerRepository";
import { Scorer } from "../../domain/entities/scorer";
import { ScorerName } from "../../domain/value-objects/scorerName";
import { ScorerId } from "../../domain/value-objects/scorerId";
import { ScorerCount } from "../../domain/entities/scorerCount";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { PlayerName } from "../../domain/value-objects/playerName";
import { ScoreCount } from "../../domain/value-objects/scoreCount";

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

  async findScorerRankingByConventionId(conventionId: ConventionID): Promise<ScorerCount[]> {

    const results = await this.db.query(`
      SELECT 
        s.name AS scorer_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(s.id) AS goals
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        scorers s ON m.id = s.match_id
      JOIN 
        players p ON s.player_id = p.id
      WHERE 
        c.id = $1
      GROUP BY 
        s.name, p.name, p.id
      ORDER BY 
        goals DESC;
    `, [ conventionId.toString() ]);

    return results.rows.map( row => new ScorerCount(
      row.player_id,
      new PlayerName(row.player_name),
      new ScorerName(row.scorer_name),
      new ScoreCount(Number(row.goals))
    ));
  };

  async findScorerRankingByPlayerId(playerId: number): Promise<ScorerCount[]> {

    const results = await this.db.query(`
      SELECT 
        s.name AS scorer_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(s.id) AS goals
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        scorers s ON m.id = s.match_id
      JOIN 
        players p ON s.player_id = p.id
      WHERE 
        p.id = $1
      GROUP BY 
        s.name, p.name, p.id
      ORDER BY 
        goals DESC;
    `, [ playerId ]);

    return results.rows.map( row => new ScorerCount(
      row.player_id,
      new PlayerName(row.player_name),
      new ScorerName(row.scorer_name),
      new ScoreCount(Number(row.goals))
    ));
  }; 
};