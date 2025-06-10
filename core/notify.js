/**
 * This module is home to all the core model objects from which the notify patterns extend
 */

import {
  ActivityStream,
  Properties,
  ActivityStreamsTypes,
  ACTIVITY_STREAMS_OBJECTS,
} from "./activitystreams2.js";
import * as validate from "../validate.js";
import { ValidationError } from "../exceptions.js";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

export const NOTIFY_NAMESPACE = "https://coar-notify.net";
/**
 * Namespace for COAR Notify, to be used to construct namespaced properties used in COAR Notify Patterns
 */

export const NotifyProperties = {
  INBOX: ["inbox", NOTIFY_NAMESPACE],
  CITE_AS: ["ietf:cite-as", NOTIFY_NAMESPACE],
  ITEM: ["ietf:item", NOTIFY_NAMESPACE],
  NAME: "name",
  MEDIA_TYPE: "mediaType",
};

export const NotifyTypes = {
  ENDORSMENT_ACTION: "coar-notify:EndorsementAction",
  INGEST_ACTION: "coar-notify:IngestAction",
  RELATIONSHIP_ACTION: "coar-notify:RelationshipAction",
  REVIEW_ACTION: "coar-notify:ReviewAction",
  UNPROCESSABLE_NOTIFICATION: "coar-notify:UnprocessableNotification",
  ABOUT_PAGE: "sorg:AboutPage",
};

const _VALIDATION_RULES = {
  [Properties.ID]: {
    default: validate.absolute_uri,
    context: {
      [Properties.CONTEXT]: { default: validate.url },
      [Properties.ORIGIN]: { default: validate.url },
      [Properties.TARGET]: { default: validate.url },
      [NotifyProperties.ITEM]: { default: validate.url },
    },
  },
  [Properties.TYPE]: {
    default: validate.type_checker,
    context: {
      [Properties.ACTOR]: {
        default: validate.one_of([
          ActivityStreamsTypes.SERVICE,
          ActivityStreamsTypes.APPLICATION,
          ActivityStreamsTypes.GROUP,
          ActivityStreamsTypes.ORGANIZATION,
          ActivityStreamsTypes.PERSON,
        ]),
      },
      [Properties.OBJECT]: {
        default: validate.at_least_one_of(ACTIVITY_STREAMS_OBJECTS),
      },
      [Properties.CONTEXT]: {
        default: validate.at_least_one_of(ACTIVITY_STREAMS_OBJECTS),
      },
      [NotifyProperties.ITEM]: {
        default: validate.at_least_one_of(ACTIVITY_STREAMS_OBJECTS),
      },
    },
  },
  [NotifyProperties.CITE_AS]: { default: validate.url },
  [NotifyProperties.INBOX]: { default: validate.url },
  [Properties.IN_REPLY_TO]: { default: validate.absolute_uri },
  [Properties.SUBJECT_TRIPLE]: { default: validate.absolute_uri },
  [Properties.OBJECT_TRIPLE]: { default: validate.absolute_uri },
  [Properties.RELATIONSHIP_TRIPLE]: { default: validate.absolute_uri },
};

export const VALIDATORS = new validate.Validator(_VALIDATION_RULES);
/**
 * Default Validator object for all pattern types
 */

export class NotifyBase {
  /**
   * Base class from which all Notify objects extend.
   * @param {ActivityStream|Object} stream - The activity stream object, or a dict from which one can be created
   * @param {boolean} validate_stream_on_construct - should the incoming stream be validated at construction-time
   * @param {boolean} validate_properties - should individual properties be validated as they are set
   * @param {Validator} validators - the validator object for this class and all nested elements
   * @param {string|Array} validation_context - the context in which this object is being validated
   * @param {boolean} properties_by_reference - should properties be get and set by reference (default true)
   */
  constructor({
    stream = null,
    validate_stream_on_construct = true,
    validate_properties = true,
    validators = null,
    validation_context = null,
    properties_by_reference = true,
  } = {}) {
    this._validate_stream_on_construct = validate_stream_on_construct;
    this._validate_properties = validate_properties;
    this._validators = validators || VALIDATORS;
    this._validation_context = validation_context;
    this._properties_by_reference = properties_by_reference;

    let validateNow = false;

    if (stream === null) {
      this._stream = new ActivityStream();
    } else if (_.isPlainObject(stream)) {
      validateNow = validate_stream_on_construct;
      this._stream = new ActivityStream(stream);
    } else {
      validateNow = validate_stream_on_construct;
      this._stream = stream;
    }

    if (!this._stream.get_property(Properties.ID)) {
      this._stream.set_property(
        Properties.ID,
        "urn:uuid:" + uuidv4().replace(/-/g, "")
      );
    }

    if (validateNow) {
      this.validate();
    }
  }

  get validate_properties() {
    return this._validate_properties;
  }

  get validate_stream_on_construct() {
    return this._validate_stream_on_construct;
  }

  get validators() {
    return this._validators;
  }

  get doc() {
    return this._stream.doc;
  }

  get id() {
    return this.get_property(Properties.ID);
  }

  set id(value) {
    this.set_property(Properties.ID, value);
  }

  get type() {
    return this.get_property(Properties.TYPE);
  }

  set type(types) {
    this.set_property(Properties.TYPE, types);
  }

  get_property(prop_name, by_reference = null) {
    if (by_reference === null) {
      by_reference = this._properties_by_reference;
    }
    const val = this._stream.get_property(prop_name);
    if (by_reference) {
      return val;
    } else {
      return _.cloneDeep(val);
    }
  }

  set_property(prop_name, value, by_reference = null) {
    if (by_reference === null) {
      by_reference = this._properties_by_reference;
    }
    this.validate_property(prop_name, value);
    if (!by_reference) {
      value = _.cloneDeep(value);
    }
    this._stream.set_property(prop_name, value);
  }

  validate() {
    console.log("NotifyBase.validate() - Starting validation");
    const ve = new ValidationError();
    
    console.log("Validating ID:", this.id);
    this.required_and_validate(ve, Properties.ID, this.id);
    
    console.log("Validating TYPE:", this.type);
    this.required_and_validate(ve, Properties.TYPE, this.type);
    
    if (ve.hasErrors()) {
      console.error("Validation failed with errors:", {
        id: this.id,
        type: this.type, 
        errors: ve.errors
      });
      throw ve;
    }
    
    console.log("Validation successful");
    return true;
  }

  validate_property(
    prop_name,
    value,
    force_validate = false,
    raise_error = true
  ) {
    if (value === null || value === undefined) {
      return [true, ""];
    }
    if (this.validate_properties || force_validate) {
      const validator = this.validators.get(
        prop_name,
        this._validation_context
      );
      console.log(`Validating property ${prop_name} with value:`, value);
      console.log(`Validator context: ${this._validation_context}`);
      if (validator !== null) {
        try {
          validator(this, value);
          console.log(`Validation passed for ${prop_name}`);
        } catch (e) {
          console.error(`Validation failed for ${prop_name}:`, e.message);
          if (raise_error) {
            throw e;
          } else {
            return [false, e.message];
          }
        }
      }
    }
    return [true, ""];
  }

  _register_property_validation_error(ve, prop_name, value) {
    try {
      // Try validation with original prop_name
      this.validate_property(prop_name, value, true, true);
    } catch (e1) {
      // If that fails, try with just the property name (no namespace)
      if (Array.isArray(prop_name)) {
        try {
          this.validate_property(prop_name[0], value, true, true);
        } catch (e2) {
          // If both fail, report the original error
          ve.addError(prop_name, e1.message);
        }
      } else {
        ve.addError(prop_name, e1.message);
      }
    }
  }

  required(ve, prop_name, value) {
    if (value === null || value === undefined) {
      const pn = Array.isArray(prop_name) ? prop_name[0] : prop_name;
      ve.addError(prop_name, validate.REQUIRED_MESSAGE.replace("{x}", pn));
    }
  }

  required_and_validate(ve, prop_name, value) {
    if (value === null || value === undefined) {
      const pn = Array.isArray(prop_name) ? prop_name[0] : prop_name;
      ve.addError(prop_name, validate.REQUIRED_MESSAGE.replace("{x}", pn));
      return;
    }

    // Handle nested NotifyBase objects
    if (value instanceof NotifyBase) {
      try {
        value.validate();
      } catch (subve) {
        ve.addNestedErrors(prop_name, subve);
      }
      return;
    }

    // Handle plain objects that should be validated as if they were NotifyBase
    if (typeof value === 'object' && value !== null) {
      try {
        // Create appropriate Notify class based on type
        let tempObj;
        if (value[Properties.TYPE[0]] === ActivityStreamsTypes.SERVICE) {
          tempObj = new NotifyService({
            stream: value,
            validate_stream_on_construct: true,
            validate_properties: this._validate_properties,
            validators: this._validators,
            validation_context: prop_name
          });
        } else if (value[Properties.TYPE[0]] === ActivityStreamsTypes.OBJECT) {
          tempObj = new NotifyObject({
            stream: value,
            validate_stream_on_construct: true,
            validate_properties: this._validate_properties,
            validators: this._validators,
            validation_context: prop_name
          });
        } else {
          tempObj = new NotifyBase({
            stream: value,
            validate_stream_on_construct: true,
            validate_properties: this._validate_properties,
            validators: this._validators,
            validation_context: prop_name
          });
        }
        tempObj.validate();
      } catch (subve) {
        ve.addNestedErrors(prop_name, subve);
      }
      return;
    }

    // Standard property validation
    this._register_property_validation_error(ve, prop_name, value);
  }

  optional_and_validate(ve, prop_name, value) {
    if (value !== null && value !== undefined) {
      if (value instanceof NotifyBase) {
        try {
          value.validate();
        } catch (subve) {
          ve.addNestedErrors(prop_name, subve);
        }
      } else {
        this._register_property_validation_error(ve, prop_name, value);
      }
    }
  }

  to_jsonld() {
    return this._stream.to_jsonld();
  }
}

export class NotifyPattern extends NotifyBase {
  static TYPE = ActivityStreamsTypes.OBJECT;

  constructor(options = {}) {
    super(options);
    this._ensure_type_contains(this.constructor.TYPE);
  }

  _ensure_type_contains(types) {
    let existing = this._stream.get_property(Properties.TYPE);
    if (existing === null || existing === undefined) {
      this.set_property(Properties.TYPE, types);
    } else {
      if (!Array.isArray(existing)) {
        existing = [existing];
      }
      if (!Array.isArray(types)) {
        types = [types];
      }
      for (const t of types) {
        if (!existing.includes(t)) {
          existing.push(t);
        }
      }
      if (existing.length === 1) {
        existing = existing[0];
      }
      this.set_property(Properties.TYPE, existing);
    }
  }

  get origin() {
    const o = this.get_property(Properties.ORIGIN);
    if (o !== null && o !== undefined) {
      return new NotifyService({
        stream: o,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: Properties.ORIGIN,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }

  set origin(value) {
    this.set_property(Properties.ORIGIN, value.doc);
  }

  get target() {
    const t = this.get_property(Properties.TARGET);
    if (t !== null && t !== undefined) {
      return new NotifyService({
        stream: t,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: Properties.TARGET,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }

  set target(value) {
    this.set_property(Properties.TARGET, value.doc);
  }

  get object() {
    const o = this.get_property(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new NotifyObject({
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

  set object(value) {
    this.set_property(Properties.OBJECT, value.doc);
  }

  get in_reply_to() {
    return this.get_property(Properties.IN_REPLY_TO);
  }

  set in_reply_to(value) {
    this.set_property(Properties.IN_REPLY_TO, value);
  }

  get actor() {
    const a = this.get_property(Properties.ACTOR);
    if (a !== null && a !== undefined) {
      return new NotifyActor({
        stream: a,
        validate_stream_on_construct: false,
        validate_properties: this.validate_properties,
        validators: this.validators,
        validation_context: Properties.ACTOR,
        properties_by_reference: this._properties_by_reference,
      });
    }
    return null;
  }

  set actor(value) {
    this.set_property(Properties.ACTOR, value.doc);
  }

  get context() {
    const c = this.get_property(Properties.CONTEXT);
    if (c !== null && c !== undefined) {
      return new NotifyObject({
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

  set context(value) {
    this.set_property(Properties.CONTEXT, value.doc);
  }

  validate({ skipNestedValidation = false } = {}) {
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

    if (!skipNestedValidation) {
      this.required_and_validate(ve, Properties.ORIGIN, this.origin);
      this.required_and_validate(ve, Properties.TARGET, this.target);
      this.required_and_validate(ve, Properties.OBJECT, this.object);
    } else {
      this.required(ve, Properties.ORIGIN, this.origin);
      this.required(ve, Properties.TARGET, this.target);
      this.required(ve, Properties.OBJECT, this.object);
    }

    this.optional_and_validate(ve, Properties.ACTOR, this.actor);
    this.optional_and_validate(ve, Properties.IN_REPLY_TO, this.in_reply_to);
    this.optional_and_validate(ve, Properties.CONTEXT, this.context);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

export class NotifyPatternPart extends NotifyBase {
  static DEFAULT_TYPE = null;
  static ALLOWED_TYPES = [];

  constructor(options = {}) {
    super(options);
    if (
      this.constructor.DEFAULT_TYPE !== null &&
      (this.type === null || this.type === undefined)
    ) {
      this.type = this.constructor.DEFAULT_TYPE;
    }
  }

  set type(types) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    if (this.constructor.ALLOWED_TYPES.length > 0) {
      for (const t of types) {
        if (!this.constructor.ALLOWED_TYPES.includes(t)) {
          throw new Error(`Type value ${t} is not one of the permitted values`);
        }
      }
    }
    if (types.length === 1) {
      types = types[0];
    }
    this.set_property(Properties.TYPE, types);
  }
}

export class NotifyService extends NotifyPatternPart {
  static DEFAULT_TYPE = ActivityStreamsTypes.SERVICE;

  get inbox() {
    return this.get_property(NotifyProperties.INBOX);
  }

  set inbox(value) {
    this.set_property(NotifyProperties.INBOX, value);
  }
}

export class NotifyObject extends NotifyPatternPart {
  static TYPE = ActivityStreamsTypes.OBJECT;

  get cite_as() {
    return this.get_property(NotifyProperties.CITE_AS);
  }

  set cite_as(value) {
    this.set_property(NotifyProperties.CITE_AS, value);
  }

  get item() {
    const i = this.get_property(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new NotifyItem({
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

  set item(value) {
    this.set_property(NotifyProperties.ITEM, value);
  }

  get triple() {
    const obj = this.get_property(Properties.OBJECT_TRIPLE);
    const rel = this.get_property(Properties.RELATIONSHIP_TRIPLE);
    const subj = this.get_property(Properties.SUBJECT_TRIPLE);
    return [obj, rel, subj];
  }

  set triple(value) {
    const [obj, rel, subj] = value;
    this.set_property(Properties.OBJECT_TRIPLE, obj);
    this.set_property(Properties.RELATIONSHIP_TRIPLE, rel);
    this.set_property(Properties.SUBJECT_TRIPLE, subj);
  }

  validate() {
    const ve = new ValidationError();
    this.required_and_validate(ve, Properties.ID, this.id);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

export class NotifyActor extends NotifyPatternPart {
  static DEFAULT_TYPE = ActivityStreamsTypes.SERVICE;
  static ALLOWED_TYPES = [
    NotifyActor.DEFAULT_TYPE,
    ActivityStreamsTypes.APPLICATION,
    ActivityStreamsTypes.GROUP,
    ActivityStreamsTypes.ORGANIZATION,
    ActivityStreamsTypes.PERSON,
  ];

  get name() {
    return this.get_property(NotifyProperties.NAME);
  }

  set name(value) {
    this.set_property(NotifyProperties.NAME, value);
  }
}

export class NotifyItem extends NotifyPatternPart {
  get media_type() {
    return this.get_property(NotifyProperties.MEDIA_TYPE);
  }

  set media_type(value) {
    this.set_property(NotifyProperties.MEDIA_TYPE, value);
  }

  validate() {
    const ve = new ValidationError();
    this.required_and_validate(ve, Properties.ID, this.id);
    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

/**
 * Mixins
 */

export function NestedPatternObjectMixin(Base) {
  return class extends Base {
    async getObject() {
      const o = this.get_property(Properties.OBJECT);
      if (o !== null && o !== undefined) {
        const { COARNotifyFactory } = await import("../factory.js");
        const nested = COARNotifyFactory.get_by_object(_.cloneDeep(o), {
          validate_stream_on_construct: false,
          validate_properties: this.validate_properties,
          validators: this.validators,
          validation_context: null,
        });
        if (nested !== null) {
          return nested;
        }
        return new NotifyObject({
          stream: _.cloneDeep(o),
          validate_stream_on_construct: false,
          validate_properties: this.validate_properties,
          validators: this.validators,
          validation_context: Properties.OBJECT,
        });
      }
      return null;
    }

    set object(value) {
      this.set_property(Properties.OBJECT, value.doc);
    }
  };
}

export function SummaryMixin(Base) {
  return class extends Base {
    get summary() {
      return this.get_property(Properties.SUMMARY);
    }

    set summary(summary) {
      this.set_property(Properties.SUMMARY, summary);
    }
  };
}
