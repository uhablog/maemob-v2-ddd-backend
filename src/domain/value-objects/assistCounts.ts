export class AssistCounts {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) throw new Error("AssistCounts cannnot be negative");
  }

  equals(other: AssistCounts): boolean {
    return this.value == other.value;
  }
};