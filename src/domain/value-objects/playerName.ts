export class PlayerName {

  constructor(private readonly _name: string) {}

  get name(): string {
    return this._name;
  }

  equals(other: PlayerName): boolean {
    return this._name === other._name;
  }
}