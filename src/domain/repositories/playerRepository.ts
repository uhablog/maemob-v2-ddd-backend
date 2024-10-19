import { Player } from "../entities/player";

export interface IPlayerRepository {
  save(player: Player): Promise<void>;
  findAll(): Promise<Player[]>;
  findById(player: Player): Promise<Player>;
}