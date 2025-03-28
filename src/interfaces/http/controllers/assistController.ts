import { Request, Response } from "express";

import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { FindAssistByMatchIdUseCase } from "../../../application/use-cases/assist/findAssistByMatchIdUseCase";
import { RegisterAssistUseCase } from "../../../application/use-cases/assist/registerAssistUseCase";
import { FindAssistRankingByConventionIdUseCase } from "../../../application/use-cases/assist/findAssistRankingByConventionId";
import { FindAssistRankingByPlayerIdUseCase } from "../../../application/use-cases/assist/findAssistRankingByPlayerId";
import { isValidUUID } from "../../../shared/common/ValidUUID";

export class AssistContoroller {

  constructor(
    private readonly findAssistByMatchIdUseCase: FindAssistByMatchIdUseCase,
    private readonly registerAssistUseCase: RegisterAssistUseCase,
    private readonly findAssistRankingByConventionIdUseCase: FindAssistRankingByConventionIdUseCase,
    private readonly findAssistRankingByPlayerIdUseCase: FindAssistRankingByPlayerIdUseCase
  ) {}

  async findAssist(req: Request, res: Response) {

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
      const results = await this.findAssistByMatchIdUseCase.execute(conventionId, matchId);
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

  async registerAssist(req: Request, res: Response) {

    const { match_id, convention_id } = req.params;
    const assists = req.body;

    const errors: string[] = [];

    if (!Array.isArray(assists)) {
      res.status(400).json({ message: "アシストは配列で指定してください。"});
      return;
    }

    assists.forEach((assist, index) => {
      if (!assist.name) {
        errors.push(`得点者[${index}]のnameは入力必須です。`);
      }
      if (!assist.player_id) {
        errors.push(`得点者[${index}]のplayer_idは入力必須です。`);
      }
      if (assist.player_id && !isValidUUID(assist.player_id)) {
        errors.push(`得点者[${index}]のplayer_idはUUID形式で指定してください。`);
      }
    });

    if (!isValidUUID(convention_id)) {
      res.status(400).json({ message: "convention_idはUUID形式で指定して下さい。" });
      return;
    }

    if (!isValidUUID(match_id)) {
      res.status(400).json({ message: "match_idはUUID形式で指定して下さい。" });
      return;
    }

    if (errors.length > 0) {
      res.status(400).json({errors});
      return;
    }

    try {
      const assistIds = await this.registerAssistUseCase.execute(assists, match_id, convention_id);

      res.status(201).json(
        assistIds.map( (assistId, index) => ({
          id: assistId,
          name: assists[index].name,
          player_id: assists[index].player_id,
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

  /**
   * アシストランキングを取得する
   * @param req convention_id or player_idの指定が必須。どちらも指定することはできない。クエリパラメータで指定。
   * @param res アシストランキング
   */
  async findAssistsRanking(req: Request, res: Response) {

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
        results = await this.findAssistRankingByConventionIdUseCase.execute(conventionId);
      } else if (playerId !== undefined) {
        results = await this.findAssistRankingByPlayerIdUseCase.execute(playerId);
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