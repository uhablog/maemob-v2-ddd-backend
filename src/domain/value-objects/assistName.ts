export class AssistName {

  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: AssistName): boolean {
    return this._value === other.value;
  }
}