/**
 * Pattern to represent an Accept notification
 * https://coar-notify.net/specification/1.0.0/accept/
 */

import { NotifyPattern } from '../core/notify.js';

function NestedPatternObjectMixin(Base) {
  return class extends Base {
    async getObject() {
      const o = this.get_property('object');
      if (o !== null && o !== undefined) {
        const { COARNotifyFactory } = await import('../factory.js');
        const nested = COARNotifyFactory.get_by_object(JSON.parse(JSON.stringify(o)), {
          validate_stream_on_construct: false,
          validate_properties: this.validate_properties,
          validators: this.validators,
          validation_context: null,
        });
        if (nested !== null) {
          return nested;
        }
        return new (await import('../core/notify.js')).NotifyObject({
          stream: JSON.parse(JSON.stringify(o)),
          validate_stream_on_construct: false,
          validate_properties: this.validate_properties,
          validators: this.validators,
          validation_context: 'object',
        });
      }
      return null;
    }

    set object(value) {
      this.set_property('object', value.doc);
    }
  };
}
import { ActivityStreamsTypes, Properties } from '../core/activitystreams2.js';
import { ValidationError } from '../exceptions.js';

export class Accept extends NestedPatternObjectMixin(NotifyPattern) {
  static TYPE = ActivityStreamsTypes.ACCEPT;

  constructor(options = {}) {
    super(options);
    this._ensure_type_contains(this.constructor.TYPE);
  }

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
