export class Auth0UserId {

  constructor(private readonly _auth0UserId: string) {}

  get auth0UserId(): string {
    return this._auth0UserId;
  }

  equals(other: Auth0UserId): boolean {
    return this._auth0UserId === other._auth0UserId;
  }
}