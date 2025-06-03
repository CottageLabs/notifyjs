/**
 * Pattern to represent the Undo Offer notification
 * https://coar-notify.net/specification/1.0.0/undo-offer/
 */

const { NotifyPattern, NestedPatternObjectMixin, SummaryMixin } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class UndoOffer extends NestedPatternObjectMixin(SummaryMixin(NotifyPattern)) {
  static TYPE = ActivityStreamsTypes.UNDO;

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

module.exports = {
  UndoOffer,
};
