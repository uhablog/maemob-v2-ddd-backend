export class ScorerName {

  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: ScorerName): boolean {
    return this._value === other.value;
  }
}