export class MomCounts {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) throw new Error("MomCounts cannnot be negative");
  }

  equals(other: MomCounts): boolean {
    return this.value == other.value;
  }
};