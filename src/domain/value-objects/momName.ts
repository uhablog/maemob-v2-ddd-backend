export class MomName {

  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: MomName): boolean {
    return this._value === other.value;
  }
}