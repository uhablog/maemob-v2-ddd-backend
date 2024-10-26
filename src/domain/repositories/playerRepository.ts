import { Player } from "../entities/player";
import { Points } from "../value-objects/points";

export interface IPlayerRepository {
  save(player: Player): Promise<number>;
  updatePoints(id: number, points: Points): Promise<void>;
  findAll(conventionId: string): Promise<Player[]>;
  findById(conventionId: string, id: number): Promise<Player | null>;
}