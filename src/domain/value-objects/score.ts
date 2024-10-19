export class Score {
  constructor(private readonly _value: number) {
    if (_value < 0) throw new Error("Score cannot be negative");
  }

  get value(): number {
    return this._value
  }

  equals(other: Score): boolean {
    return this._value === other.value;
  }
};