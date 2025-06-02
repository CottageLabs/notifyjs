/**
 * This module contains everything COAR Notify needs to know about ActivityStreams 2.0
 * https://www.w3.org/TR/activitystreams-core/
 *
 * It provides knowledge of the essential AS properties and types, and a class to wrap
 * ActivityStreams objects and provide a simple interface to work with them.
 *
 * **NOTE** this is not a complete implementation of AS 2.0, it is **only** what is required
 * to work with COAR Notify patterns.
 */

/** Namespace for Activity Streams, to be used to construct namespaced properties used in COAR Notify Patterns */
export const ACTIVITY_STREAMS_NAMESPACE =
  "https://www.w3.org/ns/activitystreams";

/**
 * ActivityStreams 2.0 properties used in COAR Notify Patterns
 *
 * These are provided as tuples, where the first element is the property name, and the second element is the namespace.
 *
 * These are suitable to be used as property names in all the property getters/setters in the notify pattern objects
 * and in the validation configuration.
 */
export const Properties = {
  /** `id` property */
  ID: ["id", ACTIVITY_STREAMS_NAMESPACE],

  /** `type` property */
  TYPE: ["type", ACTIVITY_STREAMS_NAMESPACE],

  /** `origin` property */
  ORIGIN: ["origin", ACTIVITY_STREAMS_NAMESPACE],

  /** `object` property */
  OBJECT: ["object", ACTIVITY_STREAMS_NAMESPACE],

  /** `target` property */
  TARGET: ["target", ACTIVITY_STREAMS_NAMESPACE],

  /** `actor` property */
  ACTOR: ["actor", ACTIVITY_STREAMS_NAMESPACE],

  /** `inReplyTo` property */
  IN_REPLY_TO: ["inReplyTo", ACTIVITY_STREAMS_NAMESPACE],

  /** `context` property */
  CONTEXT: ["context", ACTIVITY_STREAMS_NAMESPACE],

  /** `summary` property */
  SUMMARY: ["summary", ACTIVITY_STREAMS_NAMESPACE],

  /** `as:subject` property */
  SUBJECT_TRIPLE: ["as:subject", ACTIVITY_STREAMS_NAMESPACE],

  /** `as:object` property */
  OBJECT_TRIPLE: ["as:object", ACTIVITY_STREAMS_NAMESPACE],

  /** `as:relationship` property */
  RELATIONSHIP_TRIPLE: ["as:relationship", ACTIVITY_STREAMS_NAMESPACE],
};

/**
 * List of all the Activity Streams types COAR Notify may use.
 *
 * Note that COAR Notify also has its own custom types and they are defined in
 * coarnotify.models.notify.NotifyTypes (not included here)
 */
export const ActivityStreamsTypes = {
  // Activities
  ACCEPT: "Accept",
  ANNOUNCE: "Announce",
  REJECT: "Reject",
  OFFER: "Offer",
  TENTATIVE_ACCEPT: "TentativeAccept",
  TENTATIVE_REJECT: "TentativeReject",
  FLAG: "Flag",
  UNDO: "Undo",

  // Objects
  ACTIVITY: "Activity",
  APPLICATION: "Application",
  ARTICLE: "Article",
  AUDIO: "Audio",
  COLLECTION: "Collection",
  COLLECTION_PAGE: "CollectionPage",
  RELATIONSHIP: "Relationship",
  DOCUMENT: "Document",
  EVENT: "Event",
  GROUP: "Group",
  IMAGE: "Image",
  INTRANSITIVE_ACTIVITY: "IntransitiveActivity",
  NOTE: "Note",
  OBJECT: "Object",
  ORDERED_COLLECTION: "OrderedCollection",
  ORDERED_COLLECTION_PAGE: "OrderedCollectionPage",
  ORGANIZATION: "Organization",
  PAGE: "Page",
  PERSON: "Person",
  PLACE: "Place",
  PROFILE: "Profile",
  QUESTION: "Question",
  SERVICE: "Service",
  TOMBSTONE: "Tombstone",
  VIDEO: "Video",
};

/**
 * The sub-list of ActivityStreams types that are also objects in AS 2.0
 */
export const ACTIVITY_STREAMS_OBJECTS = [
  ActivityStreamsTypes.ACTIVITY,
  ActivityStreamsTypes.APPLICATION,
  ActivityStreamsTypes.ARTICLE,
  ActivityStreamsTypes.AUDIO,
  ActivityStreamsTypes.COLLECTION,
  ActivityStreamsTypes.COLLECTION_PAGE,
  ActivityStreamsTypes.RELATIONSHIP,
  ActivityStreamsTypes.DOCUMENT,
  ActivityStreamsTypes.EVENT,
  ActivityStreamsTypes.GROUP,
  ActivityStreamsTypes.IMAGE,
  ActivityStreamsTypes.INTRANSITIVE_ACTIVITY,
  ActivityStreamsTypes.NOTE,
  ActivityStreamsTypes.OBJECT,
  ActivityStreamsTypes.ORDERED_COLLECTION,
  ActivityStreamsTypes.ORDERED_COLLECTION_PAGE,
  ActivityStreamsTypes.ORGANIZATION,
  ActivityStreamsTypes.PAGE,
  ActivityStreamsTypes.PERSON,
  ActivityStreamsTypes.PLACE,
  ActivityStreamsTypes.PROFILE,
  ActivityStreamsTypes.QUESTION,
  ActivityStreamsTypes.SERVICE,
  ActivityStreamsTypes.TOMBSTONE,
  ActivityStreamsTypes.VIDEO,
];

/**
 * A simple wrapper around an ActivityStreams dictionary object
 *
 * Construct it with a JavaScript object that represents an ActivityStreams object, or
 * without to create a fresh, blank object.
 */
export class ActivityStream {
  /**
   * Construct a new ActivityStream object
   * @param {Object} [raw] - the raw ActivityStreams object as a JS object
   */
  constructor(raw = null) {
    /** @private @type {Object} The internal object representing the ActivityStream */
    this._doc = raw ?? {};

    /** @private @type {Array} The JSON-LD context of the ActivityStream */
    this._context = [];

    if ("@context" in this._doc) {
      this._context = Array.isArray(this._doc["@context"])
        ? [...this._doc["@context"]]
        : [this._doc["@context"]];
      delete this._doc["@context"];
    }
  }

  /**
   * The internal dictionary representation of the ActivityStream, without the JSON-LD context
   * @type {Object}
   */
  get doc() {
    return this._doc;
  }

  set doc(value) {
    this._doc = value;
  }

  /**
   * The JSON-LD context of the ActivityStream
   * @type {Array}
   */
  get context() {
    return this._context;
  }

  set context(value) {
    this._context = value;
  }

  /**
   * Register a namespace in the context of the ActivityStream
   * @param {string | [string, string]} namespace - Namespace as a string or tuple [prefix, url]
   * @private
   */
  _registerNamespace(namespace) {
    let entry = namespace;
    if (Array.isArray(namespace)) {
      const [short, url] = namespace;
      entry = { [short]: url };
    }

    // Add if not already present
    if (
      !this._context.some((ctx) => {
        if (typeof ctx === "string" && typeof entry === "string") {
          return ctx === entry;
        }
        if (typeof ctx === "object" && typeof entry === "object") {
          return JSON.stringify(ctx) === JSON.stringify(entry);
        }
        return false;
      })
    ) {
      this._context.push(entry);
    }
  }

  /**
   * Set an arbitrary property on the object. The property name can be one of:
   * - A simple string with the property name
   * - A tuple of the property name and the full namespace `["name", "http://example.com/ns"]`
   * - A tuple containing the property name and another tuple of the short name and the full namespace `["name", ["as", "http://example.com/ns"]]`
   *
   * @param {string | [string, string] | [string, [string, string]]} property - The property name
   * @param {*} value - The value to set
   */
  setProperty(property, value) {
    let propName = property;
    let namespace = null;

    if (Array.isArray(property)) {
      propName = property[0];
      namespace = property[1];
    }

    this._doc[propName] = value;

    if (namespace !== null) {
      this._registerNamespace(namespace);
    }
  }

  /**
   * Get an arbitrary property on the object. The property name can be one of:
   * - A simple string with the property name
   * - A tuple of the property name and the full namespace `["name", "http://example.com/ns"]`
   * - A tuple containing the property name and another tuple of the short name and the full namespace `["name", ["as", "http://example.com/ns"]]`
   *
   * @param {string | [string, string] | [string, [string, string]]} property - The property name
   * @returns {*} The value of the property, or null if it does not exist
   */
  getProperty(property) {
    let propName = property;
    // namespace is not needed here, but keeping for parity
    if (Array.isArray(property)) {
      propName = property[0];
    }
    return this._doc.hasOwnProperty(propName) ? this._doc[propName] : null;
  }

  /**
   * Get the activity stream as a JSON-LD object
   * @returns {Object} JSON-LD representation including @context
   */
  toJsonLd() {
    return {
      "@context": this._context,
      ...this._doc,
    };
  }
}
