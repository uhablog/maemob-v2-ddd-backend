export class Goals {

  constructor(
    public readonly value: number
  ) {
    if (value < 0) {
      throw new Error("Goals cannot be negative");
    }
  }

  equlas(other: Goals): boolean {
    return this.value === other.value;
  }

  addGoals(goals: number): Goals {
    if (goals < 0) {
      throw new Error("Cannot add negative goals");
    }
    return new Goals(this.value + goals);
  }
}