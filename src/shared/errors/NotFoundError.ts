import { BaseError } from "./BaseError";

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
};