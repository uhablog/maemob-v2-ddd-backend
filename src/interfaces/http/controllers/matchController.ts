import { Request, Response } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import { ResisterMatchUseCase } from "../../../application/use-cases/match/resisterMatchUseCase";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FindMatchByIdUseCase } from "../../../application/use-cases/match/findMatchByIdUseCase";

export class MatchController {
  constructor(
    private readonly findAllMatchUseCase: FindAllMatchesUseCase,
    private readonly findMatchByIdUseCase: FindMatchByIdUseCase,
    private readonly resisterMatchUseCase: ResisterMatchUseCase
  ) {}

  async findAll(req: Request, res: Response) {

    const conventionId = req.params.convention_id;

    if (!isValidUUID(conventionId)) {
      res.status(400).json({
        message: "convention idはUUID形式で指定して下さい"
      });
      return;
    }
    console.log('find all matches');

    try {
      const results = await this.findAllMatchUseCase.execute(conventionId);
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
  }

  async findById(req: Request, res: Response) {

    const matchId = req.params.match_id;

    if (!isValidUUID(matchId)) {
      res.status(400).json({
        message: "idはUUID形式で指定して下さい"
      });
      return;
    }

    try {
      const match = await this.findMatchByIdUseCase.execute(matchId);
      res.status(200).json({...match});
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: (error as Error).message
        });
      }
    }
  }

  async resisterMatch(req: Request, res: Response) {
    console.log('resister match: ', req.body);

    // convention idのバリデーション
    const conventionId = req.params.convention_id;
    if (!isValidUUID(conventionId)) {
      res.status(400).json({
        message: "convention idはUUID形式で指定して下さい"
      });
      return;
    }

    // リクエストボディのバリデーション
    const {
      homePlayerId,
      awayPlayerId,
      homeScore,
      awayScore
    } = req.body;
    if (
      homePlayerId === undefined ||
      awayPlayerId === undefined ||
      homeScore === undefined ||
      awayScore === undefined
    ) {
      res.status(400).json({message: "全てのプロパティを指定して下さい。"});
      return;
    }

    if (homeScore < 0 || awayScore < 0) {
      res.status(400).json({
        message: "スコアは0以上で指定して下さい。"
      });
      return;
    }

    try {
      const matchId = await this.resisterMatchUseCase.execute({
        conventionId,
        homePlayerId,
        awayPlayerId,
        homeScore,
        awayScore
      });

      res.status(201).json({
        id: matchId,
        homePlayerId,
        awayPlayerId,
        homeScore,
        awayScore
      });
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
  }
}