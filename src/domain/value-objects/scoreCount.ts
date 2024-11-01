export class ScoreCount {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) throw new Error("ScoreCount cannnot be negative");
  }

  equals(other: ScoreCount): boolean {
    return this.value == other.value;
  }
};