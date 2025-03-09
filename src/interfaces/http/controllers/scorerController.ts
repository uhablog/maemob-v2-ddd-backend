import { Request, Response } from "express";

import { FindScorerByMatchIdUseCase } from "../../../application/use-cases/scorer/findScorerByMatchIdUseCase";
import { RegisterScorerUseCase } from "../../../application/use-cases/scorer/registerScorerUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { FindScorerRankingByConventionIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByConventionId";
import { FindScorerRankingByPlayerIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByPlayerId";

export class ScorerContoroller {

  constructor(
    private readonly findScorerByMatchIdUseCase: FindScorerByMatchIdUseCase,
    private readonly registerScorerUseCase: RegisterScorerUseCase,
    private readonly findScorerRankingByConventionIdUseCase: FindScorerRankingByConventionIdUseCase,
    private readonly findScorerRankingByPlayerIdUseCase: FindScorerRankingByPlayerIdUseCase,
  ) {}

  /**
   * 試合に関する得点者を取得する
   * @param req パスパラメータでconvention_id(uuid), match_id(number)を指定
   * @param res 
   */
  async findScorer(req: Request, res: Response) {

    const conventionId = req.params.convention_id;
    const matchId = req.params.match_id;

    if (!isValidUUID(conventionId)) {
      res.status(400).json({ message: "convention_idはUUID形式で指定して下さい。" });
      return;
    }

    if (!isValidUUID(matchId)) {
      res.status(400).json({ message: "match_idはUUID形式で指定して下さい。" });
      return;
    }

    try {
      const results = await this.findScorerByMatchIdUseCase.execute(conventionId, matchId);
      res.status(200).json(results);
    } catch (error) {
      console.error(error);

      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: "Internal Server Error"
        });
      }
    }
  };

  /**
   * 試合に対して得点者の登録を行う
   * @param req name, player_idをbodyで指定必須
   * @param res 
   * @returns HTTP レスポンスの返却
   */
  async registerScorer(req: Request, res: Response) {

    const { match_id, convention_id } = req.params;
    const scorers = req.body;

    const errors: string[] = [];

    if (!Array.isArray(scorers)) {
      res.status(400).json({ message: "得点者は配列で指定してください。"});
      return;
    }

    // 各得点者のバリデーション
    scorers.forEach((scorer, index) => {
      if (!scorer.name) {
        errors.push(`得点者[${index}]のnameは必須です。`);
      }
      if (!scorer.player_id) {
        errors.push(`得点者[${index}]のplayer_idは必須です。`);
      }
      if (scorer.player_id && !isValidUUID(scorer.player_id)) {
        errors.push(`得点者[${index}]のplayer_idはUUID形式で指定してください。`);
      }
    });

    if (!isValidUUID(convention_id)) {
      errors.push("convention_idはUUID形式で指定してください。");
    }

    if (!isValidUUID(match_id)) {
      errors.push("match_idはUUID形式で指定してください。");
    }

    if (errors.length > 0) {
      res.status(400).json({errors});
      return;
    }

    try {
      const scorerIds = await this.registerScorerUseCase.execute(scorers, match_id, convention_id);

      res.status(201).json(
        scorerIds.map( (scorerId, index) => ({
          id: scorerId,
          name: scorers[index].name,
          player_id: scorers[index].player_id,
          match_id: match_id
        }))
      );
    } catch (error) {
      console.error(error);

      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error"});
      }
    }
  };

  async findScorerRanking(req: Request, res: Response) {

    const conventionId = req.query.convention_id as string;
    const playerId = req.query.player_id as string; 

    // 大会・プレイヤーどちらも指定されていない場合は400エラーを返却する
    if (conventionId === undefined && playerId === undefined) {
      res.status(400).json({ message: "convention_idもしくはplayer_idどちらか1つを指定して下さい。" });
      return;
    } else if (
      conventionId !== undefined
      && playerId !== undefined
    ) { // 大会・プレイヤーどちらも指定されている
      res.status(400).json({ message: "convention_idもしくはplayer_idどちらか1つを指定して下さい。" });
      return;
    };

    // convention_idがUUID形式かチェック
    if (conventionId !== undefined && !isValidUUID(conventionId)) {
      res.status(400).json({ message: "convention_idはUUID形式で指定して下さい。" });
      return;
    }

    // player_idが1以上の整数かチェック
    if (playerId !== undefined && !isValidUUID(playerId)) {
      res.status(400).json({ message: "player_idはUUID形式で指定して下さい。" });
      return;
    }

    try {
      let results;

      if (conventionId !== undefined) {
        results = await this.findScorerRankingByConventionIdUseCase.execute(conventionId);
      } else if (playerId !== undefined) {
        results = await this.findScorerRankingByPlayerIdUseCase.execute(playerId);
      }

      res.status(200).json(results);
    } catch (error) {
      console.error(error);

      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }

  };
};