import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../../shared/common/ValidUUID';

export class ConventionID {
  private readonly value: string;

  constructor(value?: string) {

    // valueがuuid形式でなければ例外を投げる
    if (value && !isValidUUID(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }

    this.value = value ?? uuidv4();
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ConventionID): boolean {
    return this.value === other.toString();
  }
};