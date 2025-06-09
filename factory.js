import { ActivityStream, Properties } from "./core/activitystreams2.js";
import { NotifyPattern } from "./core/notify.js";
import {
  Accept,
  AnnounceEndorsement,
  AnnounceRelationship,
  AnnounceReview,
  AnnounceServiceResult,
  Reject,
  RequestEndorsement,
  RequestReview,
  TentativelyAccept,
  TentativelyReject,
  UnprocessableNotification,
  UndoOffer,
} from "./patterns/index.js";
import { NotifyObject } from "./core/notify.js";
import { NotifyException } from "./exceptions.js";

export class COARNotifyFactory {
  /**
   * Factory for producing the correct model based on the type or data within a payload
   */

  static MODELS = [
    Accept,
    AnnounceEndorsement,
    AnnounceRelationship,
    AnnounceReview,
    AnnounceServiceResult,
    Reject,
    RequestEndorsement,
    RequestReview,
    TentativelyAccept,
    TentativelyReject,
    UnprocessableNotification,
    UndoOffer,
    NotifyObject,
  ];

  /**
   * Get the model class based on the supplied types. The returned callable is the class, not an instance.
   *
   * This is achieved by inspecting all of the known types in MODELS, and performing the following calculation:
   * 1. If the supplied types are a subset of the model types, then this is a candidate, keep a reference to it
   * 2. If the candidate fit is exact (supplied types and model types are the same), return the class
   * 3. If the class is a better fit than the last candidate, update the candidate. If the fit is exact, return the class
   * 4. Once we have run out of models to check, return the best candidate (or null if none found)
   *
   * @param {string|string[]} incoming_types - a single type or list of types. If a list is provided, ALL types must match a candidate
   * @returns {Function|null} A class representing the best fit for the supplied types, or null if no match
   */
  static get_by_types(incoming_types) {
    if (!Array.isArray(incoming_types)) {
      incoming_types = [incoming_types];
    }

    let candidate = null;
    let candidate_fit = null;

    for (const m of this.MODELS) {
      let document_types = m.TYPE;
      if (!Array.isArray(document_types)) {
        document_types = [document_types];
      }
      if (document_types.every((t) => incoming_types.includes(t))) {
        if (candidate_fit === null) {
          candidate = m;
          candidate_fit = incoming_types.length - document_types.length;
          if (candidate_fit === 0) {
            return candidate;
          }
        } else {
          const fit = incoming_types.length - document_types.length;
          if (fit === 0) {
            return m;
          }
          if (Math.abs(fit) < Math.abs(candidate_fit)) {
            candidate = m;
            candidate_fit = fit;
          }
        }
      }
    }

    return candidate;
  }

  /**
   * Get an instance of a model based on the data provided.
   *
   * Internally this calls get_by_types to determine the class to instantiate, and then creates an instance of that
   * Using the supplied args and kwargs.
   *
   * If a model cannot be found that matches the data, a NotifyException is raised.
   *
   * @param {Object} data - The raw stream data to parse and instantiate around
   * @param  {...any} args - any args to pass to the object constructor
   * @returns {NotifyPattern} A NotifyPattern of the correct type, wrapping the data
   */
  static get_by_object(data, ...args) {
    const stream = new ActivityStream(data);

    const types = stream.get_property(Properties.TYPE);
    if (types === null || types === undefined) {
      throw new NotifyException("No type found in object");
    }

    const klazz = this.get_by_types(types);

    if (klazz === null) {
      throw new NotifyException(`No model found for type(s): ${types}`);
    }

    const inst = new klazz(data, ...args);
    return inst;
  }

  /**
   * Register a new model class
   * @param {NotifyPattern} model
   */
  static register(model) {
    const existing = this.get_by_types(model.TYPE);
    if (existing !== null) {
      const index = this.MODELS.indexOf(existing);
      if (index > -1) {
        this.MODELS.splice(index, 1);
      }
    }
    this.MODELS.push(model);
  }
}
