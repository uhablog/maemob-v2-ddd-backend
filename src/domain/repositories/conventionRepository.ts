import { Convention } from "../entities/convention";
import { ConventionID } from "../value-objects/conventionId";

export interface IConventionRepository {
  save(convention: Convention): Promise<void>;
  findAll(): Promise<Convention[]>;
  findById(id: ConventionID): Promise<Convention | null>;
}