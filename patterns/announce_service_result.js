/**
 * Pattern to represent the Announce Service Result notification
 * https://coar-notify.net/specification/1.0.0/announce-resource/
 */

const { NotifyPattern, NotifyItem, NotifyProperties, NotifyObject } = require('../core/notify');
const { ActivityStreamsTypes, Properties } = require('../core/activitystreams2');
const { ValidationError } = require('../exceptions');

class AnnounceServiceResult extends NotifyPattern {
  static TYPE = ActivityStreamsTypes.ANNOUNCE;

  get object() {
    const o = this.get_property(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new AnnounceServiceResultObject({
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

  get context() {
    const c = this.get_property(Properties.CONTEXT);
    if (c !== null && c !== undefined) {
      return new AnnounceServiceResultContext({
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

class AnnounceServiceResultContext extends NotifyObject {
  get item() {
    const i = this.get_property(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new AnnounceServiceResultItem({
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

class AnnounceServiceResultItem extends NotifyItem {
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

class AnnounceServiceResultObject extends NotifyObject {
  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }
    this.required_and_validate(ve, Properties.TYPE, this.type);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

module.exports = {
  AnnounceServiceResult,
  AnnounceServiceResultContext,
  AnnounceServiceResultItem,
  AnnounceServiceResultObject,
};
