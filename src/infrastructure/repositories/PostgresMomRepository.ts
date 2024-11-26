import { Pool } from "pg";
import { PlayerId } from "../../domain/value-objects/playerId";
import { MatchId } from "../../domain/value-objects/matchId";
import { IMomRepository } from "../../domain/repositories/momRepository";
import { Mom } from "../../domain/entities/mom";
import { MomId } from "../../domain/value-objects/momId";
import { MomName } from "../../domain/value-objects/momName";
import { MomCount } from "../../domain/entities/momCount";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { PlayerName } from "../../domain/value-objects/playerName";
import { MomCounts } from "../../domain/value-objects/momCounts";

export class PostgresMomRepository implements IMomRepository {

  constructor(
    private readonly db: Pool
  ) {}

  async save(mom: Mom): Promise<void> {
    await this.db.query(`
      INSERT INTO moms(
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
      mom.id.toString(),
      mom.matchId.toString(),
      mom.playerId.toString(),
      mom.name.value
    ]);
  };

  async findByMatchId(matchId: MatchId): Promise<Mom | null> {
    const results = await this.db.query(`
      SELECT
        id
        ,name
        ,match_id
        ,player_id
      FROM
        moms
      WHERE
        match_id = $1
    `, [ matchId.toString() ]);

    if (results.rowCount !== 1) {
      return null;
    }

    return new Mom(
      new MomId(results.rows[0].id),
      new MomName(results.rows[0].name),
      new MatchId(results.rows[0].match_id),
      new PlayerId(results.rows[0].player_id)
    );
  };

  async findMomRankingByConventionId(conventionId: ConventionID): Promise<MomCount[]> {
    const results = await this.db.query(`
      SELECT 
        moms.name AS mom_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(moms.id) AS mom_counts
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        moms ON m.id = moms.match_id
      JOIN 
        players p ON moms.player_id = p.id
      WHERE 
        c.id = $1
      GROUP BY 
        moms.name, p.name, p.id
      ORDER BY 
        mom_counts DESC;
    `, [ conventionId.toString() ]);

    return results.rows.map( row => new MomCount(
      new PlayerId(row.player_id),
      new PlayerName(row.player_name),
      new MomName(row.mom_name),
      new MomCounts(Number(row.mom_counts))
    )); 
  };

  async findMomRankingByPlayerId(playerId: PlayerId): Promise<MomCount[]> {
    const results = await this.db.query(`
      SELECT 
        moms.name AS mom_name,
        p.id AS player_id,
        p.name AS player_name,
        COUNT(moms.id) AS mom_counts
      FROM 
        conventions c
      JOIN 
        matches m ON c.id = m.convention_id
      JOIN 
        moms ON m.id = moms.match_id
      JOIN 
        players p ON moms.player_id = p.id
      WHERE 
        p.id = $1
      GROUP BY 
        moms.name, p.name, p.id
      ORDER BY 
        mom_counts DESC;
    `, [ playerId.toString() ]);

    return results.rows.map( row => new MomCount(
      new PlayerId(row.player_id),
      new PlayerName(row.player_name),
      new MomName(row.mom_name),
      new MomCounts(Number(row.mom_counts))
    )); 
  };
};