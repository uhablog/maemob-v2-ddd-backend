export class Wins {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) {
      throw new Error("Win cannot be negative");
    }
  }

  equals(other: Wins): boolean {
    return this.value === other.value;
  }

  increment(): Wins {
    return new Wins(this.value + 1);
  }
}