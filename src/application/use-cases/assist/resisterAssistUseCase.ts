import { Assist } from "../../../domain/entities/assist";
import { IAssistRepository } from "../../../domain/repositories/assistRepository";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { AssistId } from "../../../domain/value-objects/assistId";
import { AssistName } from "../../../domain/value-objects/assistName";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class ResisterAssistUseCase {

  constructor(
    private readonly assistRepository: IAssistRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly conventionRepository: IConventionRepository
  ) {};

  async execute(data: ResisterAssistDTO): Promise<string> {

    // 大会の存在確認
    const convention = await this.conventionRepository.findById(new ConventionID(data.convention_id));

    if (convention == null) {
      throw new NotFoundError(`convention id: ${data.convention_id}`);
    }

    // playerがmatchしているか判定
    const match = await this.matchRepository.findById(data.match_id);

    if (match == null) {
      throw new NotFoundError(`match id: ${data.match_id}`);
    }

    // アシストのプレイヤーIDは試合のホームかアウェイのプレイヤーでなければおかしい
    if (match.homePlayerId !== data.player_id && match.awayPlayerId !== data.player_id) {
      throw new BadRequestError('試合を行ったユーザーを指定して下さい。');
    }
    
    // アシスト数は試合の得点数を超えない
    const results = await this.assistRepository.findByMatchId(data.match_id);

    /**
     * アシストがホームチームの場合、ホームチームの得点数をアシスト数が超えない
     * アシストがアウェイチームの場合、アウェイチームの得点数をアシスト数が超えない
     */
    if (data.player_id === match.homePlayerId && results.filter(result => result.playerId === match.homePlayerId).length === match.homeScore.value) {
      throw new BadRequestError(`ホームチームのアシスト数が得点数に到達しました。`);
    } else if (data.player_id === match.awayPlayerId && results.filter(result => result.playerId === match.awayPlayerId).length === match.awayScore.value) {
      throw new BadRequestError(`アウェイチームのアシスト数が得点数に到達しました。`);
    };

    // アシストの登録を行う
    const assistId = new AssistId();

    const assist = new Assist(
      assistId,
      new AssistName(data.name),
      data.match_id,
      data.player_id
    );

    await this.assistRepository.save(assist);
    return assistId.toString();
  };
};