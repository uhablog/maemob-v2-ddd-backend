import { ConventionHeldDate } from "../value-objects/conventionHeldDate";
import { ConventionID } from "../value-objects/conventionId";
import { ConventionName } from "../value-objects/conventionName";

export class Convention {
  
  constructor(
    private readonly _id: ConventionID,
    private readonly _name: ConventionName,
    private readonly _heldDate: ConventionHeldDate
  ) {}

  get id(): ConventionID {
    return this._id;
  }

  get name(): ConventionName {
    return this._name;
  }

  get heldDate(): ConventionHeldDate {
    return this._heldDate;
  }
};