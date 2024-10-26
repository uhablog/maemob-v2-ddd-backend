import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { ConventionID } from "../../../domain/value-objects/conventionId";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ConventionDTO } from "../../dto/conventionDto";

export class FindConventionByIdUseCase {

  constructor(private readonly conventionRepository: IConventionRepository) {};

  async execute(id: string): Promise<ConventionDTO> {
    const convention = await this.conventionRepository.findById(new ConventionID(id));

    if (convention === null) {
      throw new NotFoundError(`convention id ${id}`);
    };

    return {
      id: convention.id.toString(),
      name: convention.name.value,
      held_date: convention.heldDate.toString()
    }
  };
};