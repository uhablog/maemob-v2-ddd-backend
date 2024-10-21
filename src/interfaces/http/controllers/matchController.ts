import { Request, Response } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import { ResisterMatchUseCase } from "../../../application/use-cases/match/ResisterMatchUseCase";

export class MatchController {
  constructor(
    private readonly findAllMatchUseCase: FindAllMatchesUseCase,
    private readonly resisterMatchUseCase: ResisterMatchUseCase
  ) {}

  async findAll(req: Request, res: Response) {
    console.log('find all matches');

    try {
      const results = await this.findAllMatchUseCase.execute();
      res.status(200).json({results});
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error
      });
    }
  }

  async resisterMatch(req: Request, res: Response) {
    console.log('resister match: ', req.body);

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
      await this.resisterMatchUseCase.execute({
        homePlayerId,
        awayPlayerId,
        homeScore,
        awayScore
      });

      res.status(201).json({
        id: 1,
        homePlayerId,
        awayPlayerId,
        homeScore,
        awayScore
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
}