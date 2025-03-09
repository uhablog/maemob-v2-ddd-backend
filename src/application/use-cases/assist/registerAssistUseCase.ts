import { Pool } from "pg";
import { Assist } from "../../../domain/entities/assist";
import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { AssistId } from "../../../domain/value-objects/assistId";
import { AssistName } from "../../../domain/value-objects/assistName";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { RegisterAssistDTO } from "../../dto/registerAssistDto";
import { PlayerId } from "../../../domain/value-objects/playerId";
import { MatchId } from "../../../domain/value-objects/matchId";
import { Match } from "../../../domain/entities/match";

export class RegisterAssistUseCase {

  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository,
    private readonly db: Pool
  ) {};

  async execute(
    data: RegisterAssistDTO[],
    matchId: string,
    conventionId: string
  ): Promise<string[]> {

    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(conventionId));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${conventionId}`);
    }

    const client = await this.db.connect();

    const matchIdObject = new MatchId(matchId);
    // playerがmatchしているか判定
    const match = await this.matchRepository.findById(client, matchIdObject);

    if (match == null) {
      throw new NotFoundError(`match id: ${matchId}`);
    }

    const checkOverAssistResult = await this.checkOverAssist(data, match);

    if (!checkOverAssistResult['home']) {
      throw new BadRequestError(`ホームチームのアシスト数がホームチームの得点数より多く指定されています。`);
    } else if (!checkOverAssistResult['away']) {
      throw new BadRequestError(`アウェイチームのアシスト数がアウェイチームの得点数より多く指定されています。`);
    }

    try {

      await client.query("BEGIN");

      const assistIds: string[] = [];
      for (const assist of data) {
        // アシストのプレイヤーIDは試合のホームかアウェイのプレイヤーでなければおかしい
        if (match.homePlayerId.toString() !== assist.player_id && match.awayPlayerId.toString() !== assist.player_id) {
          throw new BadRequestError('試合を行ったユーザーを指定して下さい。');
        }
        // アシストの登録を行う
        const assistId = new AssistId();

        const newAssist = new Assist(
          assistId,
          new AssistName(assist.name),
          matchIdObject,
          new PlayerId(assist.player_id)
        );

        await this.assistRepository.save(newAssist);
        assistIds.push(assistId.toString());
      }

      await client.query("COMMIT");
      return assistIds;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  /**
   * 引数で受け取った登録アシストDTOの配列から各プレイヤーのアシストの合計数を算出する
   * 各プレイヤーのアシスト数が該当試合の得点数を超えないことを確認する目的で利用
   * @param assists 登録アシストDTO[]
   * @returns key: プレイヤーID、value: アシスト数のマップ
   */
  private countAssistsByPlayer(assists: RegisterAssistDTO[]): { [player_id: string]: number} {
    const assistCountMap: { [player_id: string]: number } = {};

    for(const assist of assists) {
      if (assistCountMap[assist.player_id]) {
        assistCountMap[assist.player_id]++;
      } else {
        assistCountMap[assist.player_id] = 1;
      }
    }

    return assistCountMap
  };

  /**
   * 登録アシストDTOと該当試合から、ホームプレイヤーとアウェイプレイヤーがそれぞれ該当試合の得点数を登録しようとしているアシスト数が超えないことを確認する
   * 戻り値はKeyに'home'と'away'の入ったマップ。
   * チェック結果がvalueに格納され、false=登録不可(アシスト数が得点数を超える)
   * @param assists 登録アシストDTO[]
   * @param match 該当試合
   * @returns key: 'home'と'away'の文字列、'home', 'away'のチェック結果(boolean)
   */
  private async checkOverAssist(assists: RegisterAssistDTO[], match: Match): Promise<{ [homeOrAway: string]: boolean}> {
    const assistCount = this.countAssistsByPlayer(assists);
    const results = await this.assistRepository.findByMatchId(match.id);

    const checkResult: { [homeOrAway: string]: boolean } = {};

    if (
      results.filter(result => result.playerId.equals(match.homePlayerId)).length + assistCount[match.homePlayerId.toString()] > match.homeScore.value
    ) {
      checkResult['home'] = false;
    } else {
      checkResult['home'] = true;
    }

    if (
      results.filter(result => result.playerId.equals(match.awayPlayerId)).length + assistCount[match.awayPlayerId.toString()] > match.awayScore.value
    ) {
      checkResult['away'] = false;
    } else {
      checkResult['away'] = true;
    }

    return checkResult;
  };
};