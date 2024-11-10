export class Draws {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) {
      throw new Error("Draws cannot be negative");
    }
  }

  equlas(other: Draws): boolean {
    return this.value === other.value;
  }

  increment(): Draws {
    return new Draws(this.value + 1);
  }
}