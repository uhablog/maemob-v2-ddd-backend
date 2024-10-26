import { Pool } from "pg";
import { IConventionRepository } from "../../domain/repositories/conventionRepository";
import { Convention } from "../../domain/entities/convention";
import { ConventionID } from "../../domain/value-objects/conventionId";
import { ConventionName } from "../../domain/value-objects/conventionName";
import { ConventionHeldDate } from "../../domain/value-objects/conventionHeldDate";

export class PostgresConventionRepository implements IConventionRepository {
  constructor(private db: Pool) {};

  async save(convention: Convention): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO conventions(
          id,
          name,
          held_date
        ) VALUES (
          $1,
          $2,
          $3
        )
      `, [convention.id.toString(), convention.name.value, convention.heldDate.toString()]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll(): Promise<Convention[]> {
    try {
      const results = await this.db.query(`
        SELECT
          id
          ,name
          ,held_date
        FROM
          conventions
      `);

      return results.rows.map(row => {
        const heldDate = row.held_date.toISOString().split('T')[0];
        return new Convention(
          new ConventionID(row.id),
          new ConventionName(row.name),
          new ConventionHeldDate(heldDate)
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findById(id: ConventionID): Promise<Convention | null> {
    try {
      const results = await this.db.query(`
        SELECT
          id
          ,name
          ,held_date
        FROM
          conventions
        WHERE
          id = $1
      `, [id.toString()]);

      // 1でなければnullを返却
      if (results.rowCount !== 1) {
        return null;
      };

      return new Convention(
        new ConventionID(results.rows[0].id),
        new ConventionName(results.rows[0].name),
        new ConventionHeldDate(results.rows[0].held_date.toISOString().split('T')[0]),
      );

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};