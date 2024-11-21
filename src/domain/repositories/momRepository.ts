import { Mom } from "../entities/mom";
import { MatchId } from "../value-objects/matchId";

export interface IMomRepository {

  /**
   * MOMの登録を行う
   * @param mom 登録するMOM
   */
  save(mom: Mom): Promise<void>;

  /**
   * 試合IDを指定してMOMを取得する
   * @param matchId 試合ID
   */
  findByMatchId(matchId: MatchId): Promise<Mom | null>;
}