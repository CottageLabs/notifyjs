/**
 * Pattern to represent an Announce Endorsement notification
 * https://coar-notify.net/specification/1.0.0/announce-endorsement/
 */

import {
  NotifyPattern,
  NotifyTypes,
  NotifyItem,
  NotifyProperties,
  NotifyObject,
} from "../core/notify.js";
import { ActivityStreamsTypes, Properties } from "../core/activitystreams2.js";
import { ValidationError } from "../exceptions.js";

export class AnnounceEndorsement extends NotifyPattern {
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
    try {
      let ve = new ValidationError();

      try {
        super.validate();
      } catch (superve) {
        if (superve instanceof ValidationError) {
          ve = superve;
        } else {
          throw superve;
        }
      }

      // Validate context property
      if (!this.context || !this.context.type) {
        ve.addError(
          "context",
          "`type` is a required field for context and must match validation rules"
        );
      } else {
        this.required_and_validate(ve, Properties.CONTEXT, this.context);
      }

      if (ve.hasErrors()) {
        throw ve;
      }
      return true;
    } catch (e) {
      console.error("Error validating AnnounceEndorsement:", e);
      throw e;
    }
  }
}

export class AnnounceEndorsementContext extends NotifyObject {
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

export class AnnounceEndorsementItem extends NotifyItem {
  validate() {
    let ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      if (superve instanceof ValidationError) {
        ve = superve;
      } else {
        throw superve;
      }
    }
    this.required_and_validate(ve, Properties.TYPE, this.type);
    this.required(ve, NotifyProperties.MEDIA_TYPE, this.media_type);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}
