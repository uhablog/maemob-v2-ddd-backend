export class Losses {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) {
      throw new Error("Losses cannot be negative");
    }
  }

  equlas(other: Losses): boolean {
    return this.value === other.value;
  }

  increment(): Losses {
    return new Losses(this.value + 1);
  }
}