import { Request, Response } from "express";

import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { FindMomByMatchIdUseCase } from "../../../application/use-cases/mom/findMomByMatchIdUseCase";
import { ResisterMomUseCase } from "../../../application/use-cases/mom/resisterMomUseCase";
import { FindMomRankingByConventionIdUseCase } from "../../../application/use-cases/mom/findMomRankingByConventionId";
import { FindMomRankingByPlayerIdUseCase } from "../../../application/use-cases/mom/findMomRankingByPlayerId";

export class MomContoroller {

  constructor(
    private readonly findMomByMatchIdUseCase: FindMomByMatchIdUseCase,
    private readonly resisterMomUseCase: ResisterMomUseCase,
    private readonly findMomRankingByConventionIdUseCase: FindMomRankingByConventionIdUseCase,
    private readonly findMomRankingByPlayerIdUseCase: FindMomRankingByPlayerIdUseCase
  ) {}

  async findMom(req: Request, res: Response) {

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
      const result = await this.findMomByMatchIdUseCase.execute(conventionId, matchId);
      res.status(200).json(result);
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

  async resisterMom(req: Request, res: Response) {

    const { match_id, convention_id } = req.params;
    const { name, player_id } = req.body;

    if (name === undefined) {
      res.status(400).json({ message: "nameは入力必須です。" });
      return;
    }

    if (player_id === undefined) {
      res.status(400).json({ message: "player_idは入力必須です。" });
      return;
    }

    if (!isValidUUID(convention_id)) {
      res.status(400).json({ message: "convention_idはUUID形式で指定して下さい。" });
      return;
    }

    if (!isValidUUID(match_id)) {
      res.status(400).json({ message: "match_idはUUID形式で指定して下さい。" });
      return;
    }

    if (!isValidUUID(player_id)) {
      res.status(400).json({ message: "player_idはUUID形式で指定して下さい。" });
      return;
    }

    try {
      const momId = await this.resisterMomUseCase.execute({
        name: name,
        player_id: player_id,
        match_id: match_id,
        convention_id: convention_id
      });

      res.status(201).json({
        id: momId,
        name: name,
        player_id: player_id,
        match_id: match_id
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

  async findMomRanking(req: Request, res: Response) {

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
        results = await this.findMomRankingByConventionIdUseCase.execute(conventionId);
      } else if (playerId !== undefined) {
        results = await this.findMomRankingByPlayerIdUseCase.execute(playerId);
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
  }

};