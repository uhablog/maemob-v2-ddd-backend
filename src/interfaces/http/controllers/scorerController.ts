import { Request, Response } from "express";

import { FindScorerByMatchIdUseCase } from "../../../application/use-cases/scorer/findScorerByMatchIdUseCase";
import { ResisterScorerUseCase } from "../../../application/use-cases/scorer/resisterScorerUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isPositiveInteger } from "../../../shared/common/positiveInteger";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { FindScorerRankingByConventionIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByConventionId";
import { FindScorerRankingByPlayerIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByPlayerId";

export class ScorerContoroller {

  constructor(
    private readonly findScorerByMatchIdUseCase: FindScorerByMatchIdUseCase,
    private readonly resisterScorerUseCase: ResisterScorerUseCase,
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

    try {
      const results = await this.findScorerByMatchIdUseCase.execute(conventionId, Number(matchId));
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
  async resisterScorer(req: Request, res: Response) {

    const { name, player_id } = req.body;

    if (name === undefined) {
      res.status(400).json({ message: "nameは入力必須です。" });
      return;
    }

    if (player_id === undefined) {
      res.status(400).json({ message: "player_idは入力必須です。" });
      return;
    }

    if (!isPositiveInteger(player_id)) {
      res.status(400).json({ message: "player_idは1以上の整数で指定して下さい。" });
      return;
    }

    try {
      const scorerId = await this.resisterScorerUseCase.execute({
        name: name,
        player_id: player_id,
        match_id: Number(req.params.match_id),
        convention_id: req.params.convention_id
      });

      res.status(201).json({
        id: scorerId,
        name: name,
        player_id: player_id,
        match_id: Number(req.params.match_id)
      });
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
    if (playerId !== undefined && !isPositiveInteger(playerId)) {
      res.status(400).json({ message: "player_idは1以上の整数で指定して下さい。" });
      return;
    }

    try {
      let results;

      if (conventionId !== undefined) {
        results = await this.findScorerRankingByConventionIdUseCase.execute(conventionId);
      } else if (playerId !== undefined) {
        results = await this.findScorerRankingByPlayerIdUseCase.execute(Number(playerId));
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