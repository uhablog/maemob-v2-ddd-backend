export class Points {

  constructor(private readonly _value: number) {
    if (_value < 0) throw new Error("Points cannot be negative");
  }

  get value(): number {
    return this._value;
  }

  equals(other: Points): boolean {
    return this._value === other.value;
  }

  /**
   * 引き分け時のポイント追加
   * @returns 勝ち点1追加後のPointsクラス
   */
  add1Points(): Points {
    return new Points(this._value + 1);
  }

  /**
   * 勝利時のポイント追加
   * @returns 勝点３追加後のPointsクラス
   */
  add3Points(): Points {
    return new Points(this._value + 3);
  }
}