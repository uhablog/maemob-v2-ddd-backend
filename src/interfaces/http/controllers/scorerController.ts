import { Request, Response } from "express";

import { FindScorerByMatchIdUseCase } from "../../../application/use-cases/scorer/findScorerByMatchIdUseCase";
import { ResisterScorerUseCase } from "../../../application/use-cases/scorer/resisterScorerUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isPositiveInteger } from "../../../shared/common/positiveInteger";

export class ScorerContoroller {

  constructor(
    private readonly findScorerByMatchIdUseCase: FindScorerByMatchIdUseCase,
    private readonly resisterScorerUseCase: ResisterScorerUseCase
  ) {}

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
};