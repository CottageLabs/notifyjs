/**
 * Pattern to represent a Reject notification
 * https://coar-notify.net/specification/1.0.0/reject/
 */

import { NotifyPattern, NestedPatternObjectMixin, SummaryMixin } from '../core/notify.js';
import { ActivityStreamsTypes, Properties } from '../core/activitystreams2.js';
import { ValidationError } from '../exceptions.js';

class RejectBase extends NotifyPattern {}

export class Reject extends NestedPatternObjectMixin(SummaryMixin(RejectBase)) {
  static TYPE = ActivityStreamsTypes.REJECT;

  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }

    this.required_and_validate(ve, Properties.IN_REPLY_TO, this.in_reply_to);

    const objid = this.object ? this.object.id : null;
    if (this.in_reply_to !== objid) {
      ve.addError(
        Properties.IN_REPLY_TO,
        `Expected inReplyTo id to be the same as the nested object id. inReplyTo: ${this.in_reply_to}, object.id: ${objid}`
      );
    }

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}
