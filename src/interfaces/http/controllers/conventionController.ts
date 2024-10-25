import { Request, Response } from "express";
import { FindAllConventionsUseCase } from "../../../application/use-cases/convention/findAllConventionsUseCase";
import { ResisterConventionUseCase } from "../../../application/use-cases/convention/resisterConventionUseCase";
import { isValidDate } from "../../../shared/common/validDate";
import { getToday } from "../../../shared/common/getDate";

export class ConventionController {

  constructor(
    private readonly findAllConventionUseCase: FindAllConventionsUseCase,
    private readonly resisterConventionUseCase: ResisterConventionUseCase
  ) {};

  async findAll(req: Request, res: Response) {
    console.log('Find all conventions');

    try {
      const results = await this.findAllConventionUseCase.execute();
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  };

  async resisterConvention(req: Request, res: Response) {

    const { name, held_date } = req.body;

    // nameの必須チェック
    if (name === undefined) {
      res.status(400).json({message: "nameは必須です"});
      return;
    }

    // 日付の形式チェック(yyyy-mm-dd)
    if (held_date !== undefined && !isValidDate(held_date)) {
      res.status(400).json({message: "held_dateはyyyy-mm-dd形式で指定して下さい"});
      return;
    };

    console.log(`resister convention ${name}`);

    try {
      const conventionId = await this.resisterConventionUseCase.execute({
        name,
        held_date
      });

      res.status(201).json({
        id: conventionId,
        name,
        held_date: held_date? held_date: getToday()
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  };

};