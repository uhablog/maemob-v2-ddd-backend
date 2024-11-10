import { Request, Response } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import { FindPlayerByIdUseCase } from "../../../application/use-cases/player/findPlayerByIdUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/registerPlayerUseCase";

export class PlayerController {
  constructor(
    private readonly registerPlayerUseCase: ResisterPlayerUseCase,
    private readonly findAllPlayerUseCase: FindAllPlayersUseCase,
    private readonly findPlayerByIdUseCase: FindPlayerByIdUseCase
  ) {}

  async findAll(req: Request, res: Response) {

    const conventionId = req.params.convention_id;

    if (!isValidUUID(conventionId)) {
      res.status(400).json({
        message: "convention idはUUID形式で指定して下さい"
      });
      return;
    }

    console.log('find all players');

    try {
      const results = await this.findAllPlayerUseCase.execute(conventionId);
      res.status(200).json({
        results
      });
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

  async findById(req: Request, res: Response) {

    const conventionId = req.params.convention_id;
    const playerId = Number(req.params.id);

    // validation
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

    if (!isValidUUID(conventionId)) {
      res.status(400).json({
        message: "convention idはUUID形式で指定して下さい"
      });
      return;
    }

    console.log(`find player by id: ${playerId}`);

    try {

      const player = await this.findPlayerByIdUseCase.execute(conventionId, playerId);
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

    // convention idのバリデーション
    const conventionId = req.params.convention_id;
    if (!isValidUUID(conventionId)) {
      res.status(400).json({
        message: "convention idはUUID形式で指定して下さい"
      });
      return;
    }

    // nameのバリデーション
    const { name } = req.body;
    if (name === undefined) {
      res.status(400).json({message: "nameは必須です"});
      return;
    }

    console.log(`resister player ${name}`);

    try {
      const player = await this.registerPlayerUseCase.execute({name, conventionId});
      res.status(201).json(player);
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
}