import { Convention } from "../../../domain/entities/convention";
import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { ConventionHeldDate } from "../../../domain/value-objects/conventionHeldDate";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { ConventionName } from "../../../domain/value-objects/conventionName";
import { ResisterConventionDTO } from "../../dto/resisterConventionDto";
import { getToday } from "../../../shared/common/getDate";

export class ResisterConventionUseCase {

  constructor(private readonly conventionRepository: IConventionRepository) {};

  async execute(data: ResisterConventionDTO): Promise<string> {

    try {
      let heldDate: string;

      // held_dateが指定されなければ実行日付を入力
      if (!data.held_date) {
        heldDate = getToday();
      } else {
        heldDate = data.held_date;
      }

      const conventionId = new ConventionID();

      const convention = new Convention(
        conventionId,
        new ConventionName(data.name),
        new ConventionHeldDate(heldDate)
      );

      await this.conventionRepository.save(convention);
      return conventionId.toString();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};