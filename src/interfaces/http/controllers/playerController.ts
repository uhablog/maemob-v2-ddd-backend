import { Request, Response } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/RegisterPlayerUseCase";
import { FindPlayerByIdUseCase } from "../../../application/use-cases/player/findPlayerByIdUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class PlayerController {
  constructor(
    private readonly registerPlayerUseCase: ResisterPlayerUseCase,
    private readonly findAllPlayerUseCase: FindAllPlayersUseCase,
    private readonly findPlayerByIdUseCase: FindPlayerByIdUseCase
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

  async findById(req: Request, res: Response) {

    const playerId = Number(req.params.id);

    if (playerId < 1) {
      res.status(400).json({
        message: "idは1以上で指定して下さい"
      });
      return;
    } else if (Number.isNaN(playerId)) {
      res.status(400).json({
        message: "idは1以上の整数で指定して下さい"
      });
      return;
    }

    console.log(`find player by id: ${playerId}`);

    try {

      const player = await this.findPlayerByIdUseCase.execute(playerId);
      res.status(200).json({...player});
      
    } catch (error) {

      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: "Internal Server Error"
        });
      }
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