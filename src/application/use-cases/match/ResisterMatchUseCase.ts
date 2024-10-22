import { IMatchRepository } from "../../../domain/repositories/matchRepository";
import { IPlayerRepository } from "../../../domain/repositories/playerRepository";
import { ResisterMatchDTO } from "../../dto/resisterMatchDto";
import { Pool } from "pg";
import { Match } from "../../../domain/entities/match";
import { Score } from "../../../domain/value-objects/score";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class ResisterMatchUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly db: Pool
  ) {}

  async execute(match: ResisterMatchDTO): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // 登録用の試合エンティティ作成
      const resisterMatch = new Match(
        1,
        match.homePlayerId,
        match.awayPlayerId,
        new Score(match.homeScore),
        new Score(match.awayScore),
        new Date()
      );
      const id = await this.matchRepository.save(resisterMatch);

      // 勝者を取得 home | away | draw
      const winner = resisterMatch.getWinner();
      const homePlayer = await this.playerRepository.findById(resisterMatch.homePlayerId);
      const awayPlayer = await this.playerRepository.findById(resisterMatch.awayPlayerId);

      if (homePlayer == null) {
        throw new NotFoundError(`player id ${resisterMatch.homePlayerId}`);
      }

      if (awayPlayer == null) {
        throw new NotFoundError(`player id ${resisterMatch.awayPlayerId}`)
      }

      if (winner === 'home') {
        // ホームチームに勝点3
        homePlayer.add3Points();
        await this.playerRepository.updatePoints(homePlayer.id, homePlayer.points);
      } else if (winner === 'away') {
        // アウェイチームに勝点3
        awayPlayer.add3Points();
        await this.playerRepository.updatePoints(awayPlayer.id, awayPlayer.points);
      } else if (winner === 'draw') {

        // 両者に勝点1
        homePlayer.add1Points();
        await this.playerRepository.updatePoints(homePlayer.id, homePlayer.points);

        awayPlayer.add1Points();
        await this.playerRepository.updatePoints(awayPlayer.id, awayPlayer.points);
      }

      await client.query("COMMIT");

    } catch (error) {
      client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}