/**
 * This module is home to all the core model objects from which the notify patterns extend
 */

import { ActivityStream, Properties, ActivityStreamsTypes, ACTIVITY_STREAMS_OBJECTS } from './activitystreams2.js';
import { Validator } from './validate.js';
import { ValidationError } from './exceptions.js';

/**
 * Namespace for COAR Notify, to be used to construct namespaced properties used in COAR Notify Patterns
 * @constant {string}
 */
export const NOTIFY_NAMESPACE = "https://coar-notify.net";

/**
 * COAR Notify properties used in COAR Notify Patterns
 *
 * Most of these are provided as arrays, where the first element is the property name, and the second element is the namespace.
 * Some are provided as plain strings without namespaces
 *
 * These are suitable to be used as property names in all the property getters/setters in the notify pattern objects
 * and in the validation configuration.
 */
export const NotifyProperties = {
  /** ``inbox`` property */
  INBOX: ["inbox", NOTIFY_NAMESPACE],

  /** ``ietf:cite-as`` property */
  CITE_AS: ["ietf:cite-as", NOTIFY_NAMESPACE],

  /** ``ietf:item`` property */
  ITEM: ["ietf:item", NOTIFY_NAMESPACE],

  /** ``name`` property */
  NAME: "name",

  /** ``mediaType`` property */
  MEDIA_TYPE: "mediaType"
};

/**
 * List of all the COAR Notify types patterns may use.
 *
 * These are in addition to the base Activity Streams types, which are in ActivityStreamsTypes
 */
export const NotifyTypes = {
  ENDORSMENT_ACTION: "coar-notify:EndorsementAction",
  INGEST_ACTION: "coar-notify:IngestAction",
  RELATIONSHIP_ACTION: "coar-notify:RelationshipAction",
  REVIEW_ACTION: "coar-notify:ReviewAction",
  UNPROCESSABLE_NOTIFICATION: "coar-notify:UnprocessableNotification",

  ABOUT_PAGE: "sorg:AboutPage"
};

/**
 * Validation rules for properties
 * @type {Object}
 * @private
 */
const _VALIDATION_RULES = {
  [Properties.ID]: {
    default: Validator.absolute_uri,
    context: {
      [Properties.CONTEXT]: {
        default: Validator.url
      },
      [Properties.ORIGIN]: {
        default: Validator.url
      },
      [Properties.TARGET]: {
        default: Validator.url
      },
      [NotifyProperties.ITEM]: {
        default: Validator.url
      }
    }
  },
  [Properties.TYPE]: {
    default: Validator.type_checker,
    context: {
      [Properties.ACTOR]: {
        default: Validator.one_of([
          ActivityStreamsTypes.SERVICE,
          ActivityStreamsTypes.APPLICATION,
          ActivityStreamsTypes.GROUP,
          ActivityStreamsTypes.ORGANIZATION,
          ActivityStreamsTypes.PERSON
        ])
      },
      [Properties.OBJECT]: {
        default: Validator.at_least_one_of(ACTIVITY_STREAMS_OBJECTS)
      },
      [Properties.CONTEXT]: {
        default: Validator.at_least_one_of(ACTIVITY_STREAMS_OBJECTS)
      },
      [NotifyProperties.ITEM]: {
        default: Validator.at_least_one_of(ACTIVITY_STREAMS_OBJECTS)
      }
    }
  },
  [NotifyProperties.CITE_AS]: {
    default: Validator.url
  },
  [NotifyProperties.INBOX]: {
    default: Validator.url
  },
  [Properties.IN_REPLY_TO]: {
    default: Validator.absolute_uri
  },
  [Properties.SUBJECT_TRIPLE]: {
    default: Validator.absolute_uri
  },
  [Properties.OBJECT_TRIPLE]: {
    default: Validator.absolute_uri
  },
  [Properties.RELATIONSHIP_TRIPLE]: {
    default: Validator.absolute_uri
  }
};

/**
 * Default Validator object for all pattern types
 * @type {Validator}
 */
export const VALIDATORS = new Validator(_VALIDATION_RULES);

/**
 * Base class from which all Notify objects extend.
 *
 * There are two kinds of Notify objects:
 *
 * 1. Patterns, which are the notifications themselves
 * 2. Pattern Parts, which are nested elements in the Patterns, such as objects, contexts, actors, etc
 *
 * This class forms the basis for both of those types, and provides essential services,
 * such as construction, accessors and validation, as well as supporting the essential
 * properties "id" and "type"
 */
export class NotifyBase {
  /**
   * Base constructor that all subclasses should call
   * @param {ActivityStream|Object} [stream=null] The activity stream object, or a plain object from which one can be created
   * @param {boolean} [validateStreamOnConstruct=true] Should the incoming stream be validated at construction-time
   * @param {boolean} [validateProperties=true] Should individual properties be validated as they are set
   * @param {Validator} [validators=null] The validator object for this class and all nested elements. If not provided will use the default VALIDATORS
   * @param {string|Array<string>} [validationContext=null] The context in which this object is being validated. Used to determine which validators to use
   * @param {boolean} [propertiesByReference=true] Should properties be get and set by reference (default) or by value
   */
  constructor(stream = null, validateStreamOnConstruct = true, validateProperties = true, validators = null, validationContext = null, propertiesByReference = true) {
    this._validateStreamOnConstruct = validateStreamOnConstruct;
    this._validateProperties = validateProperties;
    this._validators = validators || VALIDATORS;
    this._validationContext = validationContext;
    this._propertiesByReference = propertiesByReference;
    let validateNow = false;

    if (stream === null) {
      this._stream = new ActivityStream();
    } else if (typeof stream === 'object' && !(stream instanceof ActivityStream)) {
      validateNow = validateStreamOnConstruct;
      this._stream = new ActivityStream(stream);
    } else {
      validateNow = validateStreamOnConstruct;
      this._stream = stream;
    }

    if (!this._stream.getProperty(Properties.ID)) {
      this._stream.setProperty(Properties.ID, "urn:uuid:" + crypto.randomUUID().replace(/-/g, ""));
    }

    if (validateNow) {
      this.validate();
    }
  }

  /** Are properties being validated on set */
  get validateProperties() {
    return this._validateProperties;
  }

  /** Is the stream validated on construction */
  get validateStreamOnConstruct() {
    return this._validateStreamOnConstruct;
  }

  /** The validator object for this instance */
  get validators() {
    return this._validators;
  }

  /** The underlying ActivityStream object, excluding the JSON-LD @context */
  get doc() {
    return this._stream.doc;
  }

  /** The ``id`` of the object */
  get id() {
    return this.getProperty(Properties.ID);
  }

  set id(value) {
    this.setProperty(Properties.ID, value);
  }

  /** The ``type`` of the object */
  get type() {
    return this.getProperty(Properties.TYPE);
  }

  set type(types) {
    this.setProperty(Properties.TYPE, types);
  }

  /**
   * Generic property getter. It is strongly recommended that all accessors proxy for this function
   * as this enforces by-reference/by-value accessing, and mediates directly with the underlying
   * activity stream object.
   * @param {string|Array<string>} propName The property to retrieve
   * @param {boolean} [byReference=null] Whether to retrieve by_reference or by_value. If not supplied will default to the object-wide setting
   * @returns {*} The property value
   */
  getProperty(propName, byReference = null) {
    if (byReference === null) {
      byReference = this._propertiesByReference;
    }
    const val = this._stream.getProperty(propName);
    if (byReference) {
      return val;
    } else {
      // Deep clone using structuredClone if available, else fallback to JSON deep clone
      if (typeof structuredClone === 'function') {
        return structuredClone(val);
      } else {
        return JSON.parse(JSON.stringify(val));
      }
    }
  }

  /**
   * Generic property setter. It is strongly recommended that all accessors proxy for this function
   * as this enforces by-reference/by-value accessing, and mediates directly with the underlying
   * activity stream object.
   * @param {string|Array<string>} propName The property to set
   * @param {*} value The value to set
   * @param {boolean} [byReference=null] Whether to set by_reference or by_value. If not supplied will default to the object-wide setting
   */
  setProperty(propName, value, byReference = null) {
    if (byReference === null) {
      byReference = this._propertiesByReference;
    }
    this.validateProperty(propName, value);
    if (!byReference) {
      if (typeof structuredClone === 'function') {
        value = structuredClone(value);
      } else {
        value = JSON.parse(JSON.stringify(value));
      }
    }
    this._stream.setProperty(propName, value);
  }

  /**
   * Validate the object. This provides the basic validation on ``id`` and ``type``.
   * Subclasses should override this method with their own validation, and call this method via ``super`` first to ensure
   * the basic properties are validated.
   * @returns {boolean} True or throws ValidationError if there are errors
   * @throws {ValidationError}
   */
  validate() {
    const ve = new ValidationError();

    this.requiredAndValidate(ve, Properties.ID, this.id);
    this.requiredAndValidate(ve, Properties.TYPE, this.type);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }

  /**
   * Validate a single property. This is used internally by setProperty.
   * If the object has validateProperties set to false then that behaviour may be overridden by setting forceValidate to true
   * The validator applied to the property will be determined according to the validators property of the object
   * and the validationContext of the object.
   * @param {string|Array<string>} propName The property to validate
   * @param {*} value The value to validate
   * @param {boolean} [forceValidate=false] Whether to validate anyway, even if property validation is turned off at the object level
   * @param {boolean} [raiseError=true] Raise an exception on validation failure, or return a tuple with the result
   * @returns {[boolean, string]} A tuple of whether validation was successful, and the error message if it was not
   */
  validateProperty(propName, value, forceValidate = false, raiseError = true) {
    if (value === null || value === undefined) {
      return [true, ""];
    }
    if (this.validateProperties || forceValidate) {
      const validator = this.validators.get(propName, this._validationContext);
      if (validator !== null && validator !== undefined) {
        try {
          validator(this, value);
        } catch (ve) {
          if (raiseError) {
            throw ve;
          } else {
            return [false, ve.message];
          }
        }
      }
    }
    return [true, ""];
  }

  /**
   * Force validate the property and if an error is found, add it to the validation error
   * @param {ValidationError} ve ValidationError instance
   * @param {string|Array<string>} propName Property name
   * @param {*} value Value to validate
   * @private
   */
  _registerPropertyValidationError(ve, propName, value) {
    const [e, msg] = this.validateProperty(propName, value, true, false);
    if (!e) {
      ve.addError(propName, msg);
    }
  }

  /**
   * Add a required error to the validation error if the value is null or undefined
   * @param {ValidationError} ve ValidationError instance
   * @param {string|Array<string>} propName Property name
   * @param {*} value Value to check
   */
  required(ve, propName, value) {
    if (value === null || value === undefined) {
      const pn = Array.isArray(propName) ? propName[0] : propName;
      ve.addError(propName, Validator.REQUIRED_MESSAGE.replace("{x}", pn));
    }
  }

  /**
   * Add a required error to the validation error if the value is null or undefined, and then validate the value if not.
   * Any error messages are added to the ValidationError object
   * @param {ValidationError} ve ValidationError instance
   * @param {string|Array<string>} propName Property name
   * @param {*} value Value to check
   */
  requiredAndValidate(ve, propName, value) {
    if (value === null || value === undefined) {
      const pn = Array.isArray(propName) ? propName[0] : propName;
      ve.addError(propName, Validator.REQUIRED_MESSAGE.replace("{x}", pn));
    } else {
      if (value instanceof NotifyBase) {
        try {
          value.validate();
        } catch (subve) {
          ve.addNestedErrors(propName, subve);
        }
      } else {
        this._registerPropertyValidationError(ve, propName, value);
      }
    }
  }

  /**
   * Validate the value if it is not null or undefined, but do not raise a validation error if it is null or undefined
   * @param {ValidationError} ve ValidationError instance
   * @param {string|Array<string>} propName Property name
   * @param {*} value Value to check
   */
  optionalAndValidate(ve, propName, value) {
    if (value !== null && value !== undefined) {
      if (value instanceof NotifyBase) {
        try {
          value.validate();
        } catch (subve) {
          ve.addNestedErrors(propName, subve);
        }
      } else {
        this._registerPropertyValidationError(ve, propName, value);
      }
    }
  }

  /**
   * Get the notification pattern as JSON-LD
   * @returns {Object} JSON-LD representation of the pattern
   */
  toJsonld() {
    return this._stream.toJsonld();
  }
}

/**
 * Base class for all notification patterns
 */
export class NotifyPattern extends NotifyBase {
  /**
   * The type of the pattern. This should be overridden by subclasses, otherwise defaults to "Object"
   * @type {string}
   */
  static TYPE = ActivityStreamsTypes.OBJECT;

  /**
   * Constructor for the NotifyPattern
   * This constructor will ensure that the pattern has its mandated type TYPE in the "type" property
   * @param {ActivityStream|Object} [stream=null] The activity stream object, or a dict from which one can be created
   * @param {boolean} [validateStreamOnConstruct=true] Should the incoming stream be validated at construction-time
   * @param {boolean} [validateProperties=true] Should individual properties be validated as they are set
   * @param {Validator} [validators=null] The validator object for this class and all nested elements. If not provided will use the default VALIDATORS
   * @param {string|Array<string>} [validationContext=null] The context in which this object is being validated. Used to determine which validators to use
   * @param {boolean} [propertiesByReference=true] Should properties be get and set by reference (default) or by value
   */
  constructor(stream = null, validateStreamOnConstruct = true, validateProperties = true, validators = null, validationContext = null, propertiesByReference = true) {
    super(stream, validateStreamOnConstruct, validateProperties, validators, validationContext, propertiesByReference);
    this._ensureTypeContains(this.constructor.TYPE);
  }

  /**
   * Ensure that the type field contains the given types
   * @param {string|Array<string>} types Types to ensure
   * @private
   */
  _ensureTypeContains(types) {
    let existing = this._stream.getProperty(Properties.TYPE);
    if (existing === null || existing === undefined) {
      this.setProperty(Properties.TYPE, types);
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
      this.setProperty(Properties.TYPE, existing);
    }
  }

  /** Get the origin property of the notification */
  get origin() {
    const o = this.getProperty(Properties.ORIGIN);
    if (o !== null && o !== undefined) {
      return new NotifyService(o, false, this.validateProperties, this.validators, Properties.ORIGIN, this._propertiesByReference);
    }
    return null;
  }

  set origin(value) {
    this.setProperty(Properties.ORIGIN, value.doc);
  }

  /** Get the target property of the notification */
  get target() {
    const t = this.getProperty(Properties.TARGET);
    if (t !== null && t !== undefined) {
      return new NotifyService(t, false, this.validateProperties, this.validators, Properties.TARGET, this._propertiesByReference);
    }
    return null;
  }

  set target(value) {
    this.setProperty(Properties.TARGET, value.doc);
  }

  /** Get the object property of the notification */
  get object() {
    const o = this.getProperty(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      return new NotifyObject(o, false, this.validateProperties, this.validators, Properties.OBJECT, this._propertiesByReference);
    }
    return null;
  }

  set object(value) {
    this.setProperty(Properties.OBJECT, value.doc);
  }

  /** Get the inReplyTo property of the notification */
  get inReplyTo() {
    return this.getProperty(Properties.IN_REPLY_TO);
  }

  set inReplyTo(value) {
    this.setProperty(Properties.IN_REPLY_TO, value);
  }

  /** Get the actor property of the notification */
  get actor() {
    const a = this.getProperty(Properties.ACTOR);
    if (a !== null && a !== undefined) {
      return new NotifyActor(a, false, this.validateProperties, this.validators, Properties.ACTOR, this._propertiesByReference);
    }
    return null;
  }

  set actor(value) {
    this.setProperty(Properties.ACTOR, value.doc);
  }

  /** Get the context property of the notification */
  get context() {
    const c = this.getProperty(Properties.CONTEXT);
    if (c !== null && c !== undefined) {
      return new NotifyObject(c, false, this.validateProperties, this.validators, Properties.CONTEXT, this._propertiesByReference);
    }
    return null;
  }

  set context(value) {
    this.setProperty(Properties.CONTEXT, value.doc);
  }

  /**
   * Base validator for all notification patterns. This extends the validate function on the superclass.
   * In addition to the base class's constraints, this applies the following validation:
   * - The origin, target and object properties are required and must be valid
   * - The actor, inReplyTo and context properties are optional, but if present must be valid
   * @returns {boolean} True if valid, otherwise throws ValidationError
   * @throws {ValidationError}
   */
  validate() {
    const ve = new ValidationError();
    try {
      super.validate();
    } catch (superve) {
      ve.addNestedErrors(null, superve);
    }

    this.requiredAndValidate(ve, Properties.ORIGIN, this.origin);
    this.requiredAndValidate(ve, Properties.TARGET, this.target);
    this.requiredAndValidate(ve, Properties.OBJECT, this.object);
    this.optionalAndValidate(ve, Properties.ACTOR, this.actor);
    this.optionalAndValidate(ve, Properties.IN_REPLY_TO, this.inReplyTo);
    this.optionalAndValidate(ve, Properties.CONTEXT, this.context);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

/**
 * Base class for all pattern parts, such as objects, contexts, actors, etc
 *
 * If there is a default type specified, and a type is not given at construction, then
 * the default type will be added
 */
export class NotifyPatternPart extends NotifyBase {
  /**
   * The default type for this object, if none is provided on construction. If not provided, then no default type will be set
   * @type {string|null}
   */
  static DEFAULT_TYPE = null;

  /**
   * The list of types that are permissible for this object. If the list is empty, then any type is allowed
   * @type {Array<string>}
   */
  static ALLOWED_TYPES = [];

  /**
   * Constructor for the NotifyPatternPart
   * @param {ActivityStream|Object} [stream=null] The activity stream object, or a dict from which one can be created
   * @param {boolean} [validateStreamOnConstruct=true] Should the incoming stream be validated at construction-time
   * @param {boolean} [validateProperties=true] Should individual properties be validated as they are set
   * @param {Validator} [validators=null] The validator object for this class and all nested elements. If not provided will use the default VALIDATORS
   * @param {string|Array<string>} [validationContext=null] The context in which this object is being validated. Used to determine which validators to use
   * @param {boolean} [propertiesByReference=true] Should properties be get and set by reference (default) or by value
   */
  constructor(stream = null, validateStreamOnConstruct = true, validateProperties = true, validators = null, validationContext = null, propertiesByReference = true) {
    super(stream, validateStreamOnConstruct, validateProperties, validators, validationContext, propertiesByReference);
    if (this.constructor.DEFAULT_TYPE !== null && (this.type === null || this.type === undefined)) {
      this.type = this.constructor.DEFAULT_TYPE;
    }
  }

  /**
   * Set the type of the object, and validate that it is one of the allowed types if present
   * @param {string|Array<string>} types The type(s) to set
   */
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

    // keep single values as single values, not arrays
    if (types.length === 1) {
      types = types[0];
    }

    this.setProperty(Properties.TYPE, types);
  }
}

/**
 * Default class to represent a service in the COAR Notify pattern.
 *
 * Services are used to represent "origin" and "target" properties in the notification patterns
 *
 * Specific patterns may need to extend this class to provide their specific behaviours and validation
 */
export class NotifyService extends NotifyPatternPart {
  /**
   * The default type for a service is "Service", but the type can be set to any value
   * @type {string}
   */
  static DEFAULT_TYPE = ActivityStreamsTypes.SERVICE;

  /** Get the "inbox" property of the service */
  get inbox() {
    return this.getProperty(NotifyProperties.INBOX);
  }

  set inbox(value) {
    this.setProperty(NotifyProperties.INBOX, value);
  }
}

/**
 * Default class to represent an object in the COAR Notify pattern.
 * Objects can be used for "object" or "context" properties in notify patterns
 *
 * Specific patterns may need to extend this class to provide their specific behaviours and validation
 */
export class NotifyObject extends NotifyPatternPart {
  /** Get the "ietf:cite-as" property of the object */
  get citeAs() {
    return this.getProperty(NotifyProperties.CITE_AS);
  }

  set citeAs(value) {
    this.setProperty(NotifyProperties.CITE_AS, value);
  }

  /** Get the "ietf:item" property of the object */
  get item() {
    const i = this.getProperty(NotifyProperties.ITEM);
    if (i !== null && i !== undefined) {
      return new NotifyItem(i, false, this.validateProperties, this.validators, NotifyProperties.ITEM, this._propertiesByReference);
    }
    return null;
  }

  set item(value) {
    this.setProperty(NotifyProperties.ITEM, value);
  }

  /** Get object, relationship and subject properties as a relationship triple */
  get triple() {
    const obj = this.getProperty(Properties.OBJECT_TRIPLE);
    const rel = this.getProperty(Properties.RELATIONSHIP_TRIPLE);
    const subj = this.getProperty(Properties.SUBJECT_TRIPLE);
    return [obj, rel, subj];
  }

  set triple(value) {
    const [obj, rel, subj] = value;
    this.setProperty(Properties.OBJECT_TRIPLE, obj);
    this.setProperty(Properties.RELATIONSHIP_TRIPLE, rel);
    this.setProperty(Properties.SUBJECT_TRIPLE, subj);
  }

  /**
   * Validate the object. This overrides the base validation, as objects only absolutely require an "id" property,
   * so the base requirement for a "type" is relaxed.
   * @returns {boolean} True if valid, otherwise throws ValidationError
   * @throws {ValidationError}
   */
  validate() {
    const ve = new ValidationError();

    this.requiredAndValidate(ve, Properties.ID, this.id);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

/**
 * Default class to represents an actor in the COAR Notify pattern.
 * Actors are used to represent the "actor" property in the notification patterns
 *
 * Specific patterns may need to extend this class to provide their specific behaviours and validation
 */
export class NotifyActor extends NotifyPatternPart {
  /**
   * Default type is "Service", but can also be set as any one of the other allowed types
   * @type {string}
   */
  static DEFAULT_TYPE = ActivityStreamsTypes.SERVICE;

  /**
   * The allowed types for an actor: "Service", "Application", "Group", "Organisation", "Person"
   * @type {Array<string>}
   */
  static ALLOWED_TYPES = [
    NotifyActor.DEFAULT_TYPE,
    ActivityStreamsTypes.APPLICATION,
    ActivityStreamsTypes.GROUP,
    ActivityStreamsTypes.ORGANIZATION,
    ActivityStreamsTypes.PERSON
  ];

  /** Get the name property of the actor */
  get name() {
    return this.getProperty(NotifyProperties.NAME);
  }

  set name(value) {
    this.setProperty(NotifyProperties.NAME, value);
  }
}

/**
 * Default class to represent an item in the COAR Notify pattern.
 * Items are used to represent the "ietf:item" property in the notification patterns
 *
 * Specific patterns may need to extend this class to provide their specific behaviours and validation
 */
export class NotifyItem extends NotifyPatternPart {
  /** Get the "mediaType" property of the item */
  get mediaType() {
    return this.getProperty(NotifyProperties.MEDIA_TYPE);
  }

  set mediaType(value) {
    this.setProperty(NotifyProperties.MEDIA_TYPE, value);
  }

  /**
   * Validate the item. This overrides the base validation, as objects only absolutely require an "id" property,
   * so the base requirement for a "type" is relaxed.
   * @returns {boolean} True if valid, otherwise throws ValidationError
   * @throws {ValidationError}
   */
  validate() {
    const ve = new ValidationError();

    this.requiredAndValidate(ve, Properties.ID, this.id);

    if (ve.hasErrors()) {
      throw ve;
    }
    return true;
  }
}

/**
 * A mixin to add to a pattern which can override the default object property to return a full
 * nested pattern from the "object" property, rather than the default NotifyObject
 *
 * This mixin needs to be first on the inheritance list, as it overrides the object property
 * of the NotifyPattern class.
 *
 * For example:
 *
 * class MySpecialPattern extends NestedPatternObjectMixin(NotifyPattern) {
 *   // ...
 * }
 */
export const NestedPatternObjectMixin = (Base) => class extends Base {
  /** Retrieve an object as its correctly typed pattern, falling back to a default NotifyObject if no pattern matches */
  get object() {
    const o = this.getProperty(Properties.OBJECT);
    if (o !== null && o !== undefined) {
      // Late import to avoid circular dependency
      // Assuming COARNotifyFactory is imported from './factory.js'
      import('./factory.js').then(({ COARNotifyFactory }) => {
        const nested = COARNotifyFactory.getByObject(
          structuredClone(o),
          false,
          this.validateProperties,
          this.validators,
          null
        );
        if (nested !== null) {
          return nested;
        }
      });
      // If unable to construct the typed nested object, just return a generic object
      return new NotifyObject(
        structuredClone(o),
        false,
        this.validateProperties,
        this.validators,
        Properties.OBJECT
      );
    }
    return null;
  }

  set object(value) {
    this.setProperty(Properties.OBJECT, value.doc);
  }
};

/**
 * Mixin to provide an API for setting and getting the "summary" property of a pattern
 */
export const SummaryMixin = (Base) => class extends Base {
  /** The summary property of the pattern */
  get summary() {
    return this.getProperty(Properties.SUMMARY);
  }

  set summary(summary) {
    this.setProperty(Properties.SUMMARY, summary);
  }
};
