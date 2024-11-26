import { Mom } from "../entities/mom";
import { MomCount } from "../entities/momCount";
import { ConventionID } from "../value-objects/conventionId";
import { MatchId } from "../value-objects/matchId";
import { PlayerId } from "../value-objects/playerId";

export interface IMomRepository {

  /**
   * MOMの登録を行う
   * @param mom 登録するMOM
   */
  save(mom: Mom): Promise<void>;

  /**
   * 試合IDを指定してMOMを取得する
   * @param matchId 試合ID
   * @returns MOMが見つかった場合はMOMデータ、見つからなければnull
   */
  findByMatchId(matchId: MatchId): Promise<Mom | null>;

  /**
   * 指定された大会IDのMOMランキングを取得する
   * @param conventionId 大会ID
   */
  findMomRankingByConventionId(conventionId: ConventionID): Promise<MomCount[]>;

  /**
   * 指定されたプレイヤーIDのMOMランキングを取得する
   * @param playerId プレイヤーID
   */
  findMomRankingByPlayerId(playerId: PlayerId): Promise<MomCount[]>;
}