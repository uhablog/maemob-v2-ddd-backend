import { Request, Response } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";

export class MatchController {
  constructor(
    private readonly findAllMatchUseCase: FindAllMatchesUseCase
  ) {}

  async findAll(req: Request, res: Response) {
    console.log('find all matches');

    try {
      const results = await this.findAllMatchUseCase.execute();
      res.status(200).json({results});
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
}