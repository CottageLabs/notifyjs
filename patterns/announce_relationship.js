/**
 * Pattern to represent an Announce Relationship notification
 * https://coar-notify.net/specification/1.0.0/announce-relationship/
 */

import { NotifyPattern, NotifyTypes, NotifyObject } from '../core/notify.js';
import { ActivityStreamsTypes, Properties } from '../core/activitystreams2.js';
import { ValidationError } from '../exceptions.js';

export class AnnounceRelationship extends NotifyPattern {
  static TYPE = [ActivityStreamsTypes.ANNOUNCE, NotifyTypes.RELATIONSHIP_ACTION];

  get object() {
    const o = this.get_property(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new AnnounceRelationshipObject({
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

export class AnnounceRelationshipObject extends NotifyObject {
  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      Object.assign(ve, superve);
    }
    this.required_and_validate(ve, Properties.TYPE, this.type);

    const [subject, relationship, object] = this.triple;
    this.required_and_validate(ve, Properties.SUBJECT_TRIPLE, subject);
    this.required_and_validate(ve, Properties.RELATIONSHIP_TRIPLE, relationship);
    this.required_and_validate(ve, Properties.OBJECT_TRIPLE, object);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}
