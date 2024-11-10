export class Concede {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) {
      throw new Error("Conced cannot be negative");
    }
  }

  equlas(other: Concede): boolean {
    return this.value === other.value;
  }

  addConcede(concede: number): Concede{
    if (concede < 0) {
      throw new Error("Cannot add negative concede");
    }
    return new Concede(this.value + concede);
  }
}