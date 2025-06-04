import { NotifyException } from './exceptions.js';
import { RequestsHttpLayer } from './http.js';
import { NotifyPattern } from './core/notify.js';

export class NotifyResponse {
  /**
   * An object representing the response from a COAR Notify inbox.
   *
   * This contains the action that was carried out on the server:
   * - CREATED - a new resource was created
   * - ACCEPTED - the request was accepted, but the resource was not yet created
   *
   * In the event that the resource is created, then there will also be a location
   * URL which will give you access to the resource
   */
  static CREATED = 'created';
  static ACCEPTED = 'accepted';

  /**
   * Construct a new NotifyResponse object with the action (created or accepted) and the location URL (optional)
   * @param {string} action - The action which the server said it took
   * @param {string|null} location - The HTTP URI for the resource that was created (if present)
   */
  constructor(action, location = null) {
    this._action = action;
    this._location = location;
  }

  /**
   * The action that was taken, will be one of the constants CREATED or ACCEPTED
   */
  get action() {
    return this._action;
  }

  /**
   * The HTTP URI of the created resource, if present
   */
  get location() {
    return this._location;
  }
}

export class COARNotifyClient {
  /**
   * The COAR Notify Client, which is the mechanism through which you will interact with external inboxes.
   *
   * If you do not supply an inbox URL at construction you will
   * need to supply it via the ``inbox_url`` setter, or when you send a notification
   *
   * @param {string|null} inbox_url - HTTP URI of the inbox to communicate with by default
   * @param {HttpLayer|null} http_layer - An implementation of the HttpLayer interface to use for sending HTTP requests.
   *                                     If not provided, the default implementation will be used based on ``requests``
   */
  constructor(inbox_url = null, http_layer = null) {
    this._inbox_url = inbox_url;
    this._http = http_layer !== null ? http_layer : new RequestsHttpLayer();
  }

  /**
   * The HTTP URI of the inbox to communicate with by default
   */
  get inbox_url() {
    return this._inbox_url;
  }

  /**
   * Set the HTTP URI of the inbox to communicate with by default
   */
  set inbox_url(value) {
    this._inbox_url = value;
  }

  /**
   * Send the given notification to the inbox.  If no inbox URL is provided, the default inbox URL will be used.
   *
   * @param {NotifyPattern} notification - The notification object (from the models provided, or a subclass you have made of the NotifyPattern class)
   * @param {string|null} inbox_url - The HTTP URI to send the notification to.  Omit if using the default inbox_url supplied in the constructor.
   *                                  If it is omitted, and no value is passed here then we will also look in the ``target.inbox`` property of the notification
   * @param {boolean} validate - Whether to validate the notification before sending.  If you are sure the notification is valid, you can set this to False
   * @returns {NotifyResponse} a NotifyResponse object representing the response from the server
   */
  send(notification, inbox_url = null, validate = true) {
    if (inbox_url === null) {
      inbox_url = this._inbox_url;
    }
    if (inbox_url === null) {
      inbox_url = notification.target?.inbox;
    }
    if (inbox_url === null) {
      throw new Error('No inbox URL provided at the client, method, or notification level');
    }

    if (validate) {
      if (!notification.validate()) {
        throw new NotifyException('Attempting to send invalid notification; to override set validate=false when calling this method');
      }
    }

    const resp = this._http.post(inbox_url, {
      data: JSON.stringify(notification.to_jsonld()),
      headers: { 'Content-Type': 'application/ld+json;profile="https://www.w3.org/ns/activitystreams"' },
    });

    if (resp.status_code === 201) {
      return new NotifyResponse(NotifyResponse.CREATED, resp.header('Location'));
    } else if (resp.status_code === 202) {
      return new NotifyResponse(NotifyResponse.ACCEPTED);
    }

    throw new NotifyException(`Unexpected response: ${resp.status_code}`);
  }
}
