/**
 * This module contains everything COAR Notify needs to know about ActivityStreams 2.0
 * https://www.w3.org/TR/activitystreams-core/
 *
 * It provides knowledge of the essential AS properties and types, and a class to wrap
 * ActivityStreams objects and provide a simple interface to work with them.
 *
 * NOTE: this is not a complete implementation of AS 2.0, it is only what is required
 * to work with COAR Notify patterns.
 */

/**
 * Namespace for Activity Streams, to be used to construct namespaced properties used in COAR Notify Patterns
 */
const ACTIVITY_STREAMS_NAMESPACE = "https://www.w3.org/ns/activitystreams";

/**
 * ActivityStreams 2.0 properties used in COAR Notify Patterns
 *
 * These are provided as arrays, where the first element is the property name, and the second element is the namespace.
 *
 * These are suitable to be used as property names in all the property getters/setters in the notify pattern objects
 * and in the validation configuration.
 */
const Properties = {
  ID: ["id", ACTIVITY_STREAMS_NAMESPACE],
  TYPE: ["type", ACTIVITY_STREAMS_NAMESPACE],
  ORIGIN: ["origin", ACTIVITY_STREAMS_NAMESPACE],
  OBJECT: ["object", ACTIVITY_STREAMS_NAMESPACE],
  TARGET: ["target", ACTIVITY_STREAMS_NAMESPACE],
  ACTOR: ["actor", ACTIVITY_STREAMS_NAMESPACE],
  IN_REPLY_TO: ["inReplyTo", ACTIVITY_STREAMS_NAMESPACE],
  CONTEXT: ["context", ACTIVITY_STREAMS_NAMESPACE],
  SUMMARY: ["summary", ACTIVITY_STREAMS_NAMESPACE],
  SUBJECT_TRIPLE: ["as:subject", ACTIVITY_STREAMS_NAMESPACE],
  OBJECT_TRIPLE: ["as:object", ACTIVITY_STREAMS_NAMESPACE],
  RELATIONSHIP_TRIPLE: ["as:relationship", ACTIVITY_STREAMS_NAMESPACE],
};

/**
 * List of all the Activity Streams types COAR Notify may use.
 *
 * Note that COAR Notify also has its own custom types defined elsewhere.
 */
const ActivityStreamsTypes = {
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
const ACTIVITY_STREAMS_OBJECTS = [
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
 */
class ActivityStream {
  /**
   * Construct a new ActivityStream object
   * @param {Object} raw - the raw ActivityStreams object, as a dictionary
   */
  constructor(raw = null) {
    this._doc = raw !== null ? raw : {};
    this._context = [];
    if (this._doc["@context"]) {
      this._context = Array.isArray(this._doc["@context"]) ? this._doc["@context"] : [this._doc["@context"]];
      delete this._doc["@context"];
    }
  }

  /**
   * The internal dictionary representation of the ActivityStream, without the json-ld context
   */
  get doc() {
    return this._doc;
  }

  set doc(doc) {
    this._doc = doc;
  }

  /**
   * The json-ld context of the ActivityStream
   */
  get context() {
    return this._context;
  }

  set context(context) {
    this._context = context;
  }

  /**
   * Register a namespace in the context of the ActivityStream
   * @param {string|Array} namespace - namespace string or tuple [short, url]
   */
  _register_namespace(namespace) {
    let entry = namespace;
    if (Array.isArray(namespace)) {
      const [short, url] = namespace;
      entry = { [short]: url };
    }
    if (!this._context.some((e) => JSON.stringify(e) === JSON.stringify(entry))) {
      this._context.push(entry);
    }
  }

  /**
   * Set an arbitrary property on the object.
   * The property name can be:
   * - A simple string with the property name
   * - An array of [property name, full namespace]
   * - An array of [property name, [short name, full namespace]]
   * @param {string|Array} property - the property name
   * @param {*} value - the value to set
   */
  set_property(property, value) {
    let prop_name = property;
    let namespace = null;
    if (Array.isArray(property)) {
      prop_name = property[0];
      namespace = property[1];
    }
    this._doc[prop_name] = value;
    if (namespace !== null) {
      this._register_namespace(namespace);
    }
  }

  /**
   * Get an arbitrary property on the object.
   * The property name can be:
   * - A simple string with the property name
   * - An array of [property name, full namespace]
   * - An array of [property name, [short name, full namespace]]
   * @param {string|Array} property - the property name
   * @returns {*} the value of the property, or null if it does not exist
   */
  get_property(property) {
    let prop_name = property;
    let namespace = null;
    if (Array.isArray(property)) {
      prop_name = property[0];
      namespace = property[1];
    }
    return this._doc[prop_name] || null;
  }

  /**
   * Get the activity stream as a JSON-LD object
   * @returns {Object}
   */
  to_jsonld() {
    return {
      "@context": this._context,
      ...this._doc,
    };
  }
}

module.exports = {
  ACTIVITY_STREAMS_NAMESPACE,
  Properties,
  ActivityStreamsTypes,
  ACTIVITY_STREAMS_OBJECTS,
  ActivityStream,
};
