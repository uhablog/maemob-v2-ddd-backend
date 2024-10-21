import { Request, Response } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/RegisterPlayerUseCase";

export class PlayerController {
  constructor(
    private readonly registerPlayerUseCase: ResisterPlayerUseCase,
    private readonly findAllPlayerUseCase: FindAllPlayersUseCase
  ) {}

  async findAll(req: Request, res: Response) {

    console.log('find all players');

    try {
      const results = await this.findAllPlayerUseCase.execute();
      res.status(200).json({
        results
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }

  async resister(req: Request, res: Response) {

    const { name } = req.body;

    if (name === undefined) {
      res.status(400).json({message: "nameは必須です"});
      return;
    }

    console.log(`resister player ${name}`);

    try {
      const id = await this.registerPlayerUseCase.execute({name});
      res.status(201).json({
        id: id,
        name: name,
        points: 0
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
}