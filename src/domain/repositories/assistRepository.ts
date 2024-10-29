import { Assist } from "../entities/assist";

export interface IAssistRepository {
  save(assist: Assist): Promise<void>;
  findByMatchId(matchId: number): Promise<Assist[]>;
}