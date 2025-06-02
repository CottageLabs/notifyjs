/**
 * This module contains all the client-specific code for sending notifications
 * to an inbox and receiving the responses it may return
 */

import { NotifyException } from "./exceptions.js";
import { RequestsHttpLayer, HttpLayer } from "./http.js";
import { NotifyPattern } from "./notify.js";

/**
 * An object representing the response from a COAR Notify inbox.
 *
 * This contains the action that was carried out on the server:
 *
 * - CREATED - a new resource was created
 * - ACCEPTED - the request was accepted, but the resource was not yet created
 *
 * In the event that the resource is created, then there will also be a location
 * URL which will give you access to the resource
 */
export class NotifyResponse {
  /**
   * @type {string}
   */
  static CREATED = "created";

  /**
   * @type {string}
   */
  static ACCEPTED = "accepted";

  /**
   * Construct a new NotifyResponse object with the action (created or accepted) and the location URL (optional)
   * @param {string} action The action which the server said it took
   * @param {string|null} [location=null] The HTTP URI for the resource that was created (if present)
   */
  constructor(action, location = null) {
    this._action = action;
    this._location = location;
  }

  /**
   * The action that was taken, will be one of the constants CREATED or ACCEPTED
   * @returns {string}
   */
  get action() {
    return this._action;
  }

  /**
   * The HTTP URI of the created resource, if present
   * @returns {string|null}
   */
  get location() {
    return this._location;
  }
}

/**
 * The COAR Notify Client, which is the mechanism through which you will interact with external inboxes.
 *
 * If you do not supply an inbox URL at construction you will
 * need to supply it via the ``inbox_url`` setter, or when you send a notification
 */
export class COARNotifyClient {
  /**
   * @param {string|null} [inboxUrl=null] HTTP URI of the inbox to communicate with by default
   * @param {HttpLayer|null} [httpLayer=null] An implementation of the HttpLayer interface to use for sending HTTP requests.
   *                                         If not provided, the default implementation will be used based on fetch
   */
  constructor(inboxUrl = null, httpLayer = null) {
    this._inboxUrl = inboxUrl;
    this._http = httpLayer !== null ? httpLayer : new RequestsHttpLayer();
  }

  /**
   * The HTTP URI of the inbox to communicate with by default
   * @returns {string|null}
   */
  get inboxUrl() {
    return this._inboxUrl;
  }

  /**
   * Set the HTTP URI of the inbox to communicate with by default
   * @param {string} value
   */
  set inboxUrl(value) {
    this._inboxUrl = value;
  }

  /**
   * Send the given notification to the inbox. If no inbox URL is provided, the default inbox URL will be used.
   * @param {NotifyPattern} notification The notification object (from the models provided, or a subclass you have made of the NotifyPattern class)
   * @param {string|null} [inboxUrl=null] The HTTP URI to send the notification to. Omit if using the default inboxUrl supplied in the constructor.
   *                                     If it is omitted, and no value is passed here then we will also look in the ``target.inbox`` property of the notification
   * @param {boolean} [validate=true] Whether to validate the notification before sending. If you are sure the notification is valid, you can set this to false
   * @returns {Promise<NotifyResponse>}
   * @throws {NotifyException|Error}
   */
  async send(notification, inboxUrl = null, validate = true) {
    if (inboxUrl === null) {
      inboxUrl = this._inboxUrl;
    }
    if (inboxUrl === null) {
      inboxUrl = notification.target?.inbox;
    }
    if (inboxUrl === null) {
      throw new Error(
        "No inbox URL provided at the client, method, or notification level"
      );
    }

    if (validate) {
      if (!notification.validate()) {
        throw new NotifyException(
          "Attempting to send invalid notification; to override set validate=false when calling this method"
        );
      }
    }

    const resp = await this._http.post(
      inboxUrl,
      JSON.stringify(notification.toJsonld()),
      {
        "Content-Type":
          'application/ld+json;profile="https://www.w3.org/ns/activitystreams"',
      }
    );

    if (resp.statusCode === 201) {
      return new NotifyResponse(
        NotifyResponse.CREATED,
        resp.header("Location")
      );
    } else if (resp.statusCode === 202) {
      return new NotifyResponse(NotifyResponse.ACCEPTED);
    }

    throw new NotifyException(`Unexpected response: ${resp.statusCode}`);
  }
}
