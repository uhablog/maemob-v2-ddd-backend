import { Request, Response } from "express";

import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isPositiveInteger } from "../../../shared/common/positiveInteger";
import { FindAssistByMatchIdUseCase } from "../../../application/use-cases/assist/findAssistByMatchIdUseCase";
import { ResisterAssistUseCase } from "../../../application/use-cases/assist/resisterAssistUseCase";

export class AssistContoroller {

  constructor(
    private readonly findAssistByMatchIdUseCase: FindAssistByMatchIdUseCase,
    private readonly resisterAssistUseCase: ResisterAssistUseCase
  ) {}

  async findAssist(req: Request, res: Response) {

    const conventionId = req.params.convention_id;
    const matchId = req.params.match_id;

    try {
      const results = await this.findAssistByMatchIdUseCase.execute(conventionId, Number(matchId));
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

  async resisterAssist(req: Request, res: Response) {

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
      const assistId = await this.resisterAssistUseCase.execute({
        name: name,
        player_id: player_id,
        match_id: Number(req.params.match_id),
        convention_id: req.params.convention_id
      });

      res.status(201).json({
        id: assistId,
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