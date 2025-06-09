import { NotifyPattern } from "../core/notify.js";
import { ActivityStreamsTypes, Properties } from "../core/activitystreams2.js";
import { ValidationError } from "../exceptions.js";

export class Accept extends NotifyPattern {
  static TYPE = ActivityStreamsTypes.ACCEPT;

  constructor(options = {}) {
    super(options);
    this._ensure_type_contains(this.constructor.TYPE);
  }

  async validate() {
    const ve = new ValidationError();

    // Validate required fields directly
    if (!this.in_reply_to) {
      ve.addError(Properties.IN_REPLY_TO, "inReplyTo is required");
    }

    const object = this.get_property("object");
    if (!object) {
      ve.addError(Properties.OBJECT, "object is required");
    } else if (!object.id) {
      ve.addError(Properties.OBJECT, "object.id is required");
    }

    if (this.in_reply_to && object?.id && this.in_reply_to !== object.id) {
      ve.addError(
        Properties.IN_REPLY_TO,
        `inReplyTo must match object.id (${this.in_reply_to} != ${object.id})`
      );
    }

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}
