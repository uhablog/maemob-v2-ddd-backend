import { Request, Response } from "express";

import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { BadRequestError } from "../../../shared/errors/BadRequest";
import { isValidUUID } from "../../../shared/common/ValidUUID";
import { FindMomByMatchIdUseCase } from "../../../application/use-cases/mom/findMomByMatchIdUseCase";
import { ResisterMomUseCase } from "../../../application/use-cases/mom/resisterMomUseCase";

export class MomContoroller {

  constructor(
    private readonly findMomByMatchIdUseCase: FindMomByMatchIdUseCase,
    private readonly resisterMomUseCase: ResisterMomUseCase,
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

};