/**
 * Pattern to represent a Request Endorsement notification
 * https://coar-notify.net/specification/1.0.0/request-endorsement/
 */

import { NotifyPattern, NotifyTypes, NotifyItem, NotifyProperties, NotifyObject } from '../core/notify.js';
import { ActivityStreamsTypes, Properties } from '../core/activitystreams2.js';
import { ValidationError } from '../exceptions.js';

export class RequestEndorsement extends NotifyPattern {
  static TYPE = [ActivityStreamsTypes.OFFER, NotifyTypes.ENDORSMENT_ACTION];

  get object() {
    const o = this.get_property(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new RequestEndorsementObject({
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

export class RequestEndorsementObject extends NotifyObject {
  get item() {
    const i = this.get_property(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new RequestEndorsementItem({
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

export class RequestEndorsementItem extends NotifyItem {
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
