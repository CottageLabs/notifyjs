const { NotifyPattern, SummaryMixin, NotifyTypes } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class UnprocessableNotification extends NotifyPattern {
  /**
   * Class to represent the Unprocessable Notification notification
   */
  static TYPE = [ActivityStreamsTypes.FLAG, NotifyTypes.UNPROCESSABLE_NOTIFICATION];

  /**
   * In addition to the base validation apply the following constraints:
   * - The inReplyTo property is required
   * - The summary property is required
   * @returns {boolean}
   */
  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }

    // Technically, no need to validate the value, as this is handled by the superclass,
    // but leaving it in for completeness
    this.required_and_validate(ve, Properties.IN_REPLY_TO, this.in_reply_to);
    this.required(ve, Properties.SUMMARY, this.summary);

    if (ve.has_errors()) {
      throw ve;
    }

    return true;
  }
}

module.exports = {
  UnprocessableNotification,
};
