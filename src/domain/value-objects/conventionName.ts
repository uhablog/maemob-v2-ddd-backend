export class ConventionName {

  constructor(
    private readonly _value: string 
  ) {}

  get value(): string {
    return this._value;
  }

  equals(other: ConventionName): boolean {
    return this._value === other.value;
  };
};