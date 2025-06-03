/**
 * Pattern to represent an Announce Endorsement notification
 * https://coar-notify.net/specification/1.0.0/announce-endorsement/
 */

const { NotifyPattern, NotifyTypes, NotifyItem, NotifyProperties, NotifyObject } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class AnnounceEndorsement extends NotifyPattern {
  static TYPE = [ActivityStreamsTypes.ANNOUNCE, NotifyTypes.ENDORSMENT_ACTION];

  get context() {
    const c = this.get_property(Properties.CONTEXT);
    if (c !== null && c !== undefined) {
      return new AnnounceEndorsementContext({
        stream: c,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: Properties.CONTEXT,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }

  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }
    this.required_and_validate(ve, Properties.CONTEXT, this.context);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

class AnnounceEndorsementContext extends NotifyObject {
  get item() {
    const i = this.get_property(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new AnnounceEndorsementItem({
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

class AnnounceEndorsementItem extends NotifyItem {
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
  AnnounceEndorsement,
  AnnounceEndorsementContext,
  AnnounceEndorsementItem,
};
