import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { IScorerRepository } from "../../../domain/repositories/scorerRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class FindScorerRankingByPlayerIdUseCase {

  constructor(
    private readonly scorerRepository: IScorerRepository,
    private readonly playerRepository: IPlayerRepository
  ) {}

  async execute(
    playerId: number
  ): Promise<ScorerCountDTO[]> {

    /**
     * プレイヤーの存在確認
     */
    const player = await this.playerRepository.findById(playerId);

    if (player == null) {
      throw new NotFoundError(`player id: ${playerId}`);
    }

    // 得点ランキングの取得
    const results = await this.scorerRepository.findScorerRankingByPlayerId(playerId);

    return results.map( (result) => result.toJSON() as ScorerCountDTO);
  };
};