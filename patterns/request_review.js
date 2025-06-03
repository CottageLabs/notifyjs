/**
 * Pattern to represent a Request Review notification
 * https://coar-notify.net/specification/1.0.0/request-review/
 */

const { NotifyPattern, NotifyTypes, NotifyObject, NotifyItem, NotifyProperties } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class RequestReview extends NotifyPattern {
  static TYPE = [ActivityStreamsTypes.OFFER, NotifyTypes.REVIEW_ACTION];

  get object() {
    const o = this.get_property(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new RequestReviewObject({
        stream: o,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: Properties.OBJECT,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }
}

class RequestReviewObject extends NotifyObject {
  get item() {
    const i = this.get_property(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new RequestReviewItem({
        stream: i,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: NotifyProperties.ITEM,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }
}

class RequestReviewItem extends NotifyItem {
  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }
    this.required_and_validate(ve, Properties.TYPE, this.type);
    this.required(ve, NotifyProperties.MEDIA_TYPE, this.media_type);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

module.exports = {
  RequestReview,
  RequestReviewObject,
  RequestReviewItem,
};
