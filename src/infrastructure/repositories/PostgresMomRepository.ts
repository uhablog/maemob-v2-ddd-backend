import { Pool } from "pg";
import { PlayerId } from "../../domain/value-objects/playerId";
import { MatchId } from "../../domain/value-objects/matchId";
import { IMomRepository } from "../../domain/repositories/momRepository";
import { Mom } from "../../domain/entities/mom";
import { MomId } from "../../domain/value-objects/momId";
import { MomName } from "../../domain/value-objects/momName";

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
};