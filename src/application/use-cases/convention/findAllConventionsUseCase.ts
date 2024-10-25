import { IConventionRepository } from "../../../domain/repositories/conventionRepository";
import { ConventionDTO } from "../../dto/conventionDto";

export class FindAllConventionsUseCase {

  constructor(private readonly conventionRepository: IConventionRepository) {};

  async execute(): Promise<ConventionDTO[]> {
    try {
      const results = await this.conventionRepository.findAll();
      return results.map((result) => ({
        id: result.id.toString(),
        name: result.name.value,
        held_date: result.heldDate.toString()
      }));
    } catch (error) {
      console.error("Error Find All Conventions: ", error);
      throw new Error("Faild to findAllConventions");
    }
  };
};