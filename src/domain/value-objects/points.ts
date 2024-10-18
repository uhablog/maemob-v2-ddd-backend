export class Points {

  constructor(private readonly _value: number) {
    if (_value < 0) throw new Error("Points cannot be negative");
  }

  get value(): number {
    return this._value;
  }

  equals(other: Points): boolean {
    return this._value === other.value;
  }

  add(addPoints: Points): Points {
    return new Points(this._value + addPoints.value);
  }
}