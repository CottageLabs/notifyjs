/**
 * Pattern to represent a Tentative Accept notification
 * https://coar-notify.net/specification/1.0.0/tentative-accept/
 */

const { NotifyPattern, SummaryMixin, NestedPatternObjectMixin } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class TentativelyAccept extends NestedPatternObjectMixin(SummaryMixin(NotifyPattern)) {
  static TYPE = ActivityStreamsTypes.TENTATIVE_ACCEPT;

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
  TentativelyAccept,
};
