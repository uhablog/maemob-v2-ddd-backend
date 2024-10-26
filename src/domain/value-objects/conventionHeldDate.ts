import { isValidDate } from "../../shared/common/validDate";

export class ConventionHeldDate {

  private readonly _value: Date;

  constructor(dateString: string) {
    if (!isValidDate(dateString)) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    this._value = new Date(dateString);
  }

  public toString(): string {
    // yyyy-mm-dd形式で返却
    return this._value.toISOString().split('T')[0]
  }

  public equals(other: ConventionHeldDate): boolean {
    return this.toString() === other.toString();
  }
};