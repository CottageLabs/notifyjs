import { COARNotifyFactory } from './factory.js';

export class COARNotifyReceipt {
  /**
   * An object representing the response from a COAR Notify server.
   *
   * Server implementations should construct and return this object with the appropriate properties
   * when implementing the notification_received binding.
   *
   * @param {number} status - the HTTP status code, should be one of the constants CREATED (201) or ACCEPTED (202)
   * @param {string|null} location - the HTTP URI for the resource that was created (if present)
   */
  static CREATED = 201;
  static ACCEPTED = 202;

  constructor(status, location = null) {
    this._status = status;
    this._location = location;
  }

  /**
   * The status code of the response. Should be one of the constants CREATED (201) or ACCEPTED (202)
   */
  get status() {
    return this._status;
  }

  /**
   * The HTTP URI of the created resource, if present
   */
  get location() {
    return this._location;
  }
}

export class COARNotifyServiceBinding {
  /**
   * Interface for implementing a COAR Notify server binding.
   *
   * Server implementation should extend this class and implement the notification_received method.
   *
   * That method will receive a NotifyPattern object, which will be one of the known types
   * and should return a COARNotifyReceipt object with the appropriate status code and location URL.
   */
  notification_received(notification) {
    throw new Error('NotImplementedError');
  }
}

export class COARNotifyServerError extends Error {
  /**
   * An exception class for server errors in the COAR Notify server implementation.
   *
   * The web layer of your server implementation should be able to intercept this from the
   * receive method and return the appropriate HTTP status code and message to the user.
   *
   * @param {number} status - HTTP Status code to respond to the client with
   * @param {string} msg - Message to send back to the client
   */
  constructor(status, msg) {
    super(msg);
    this._status = status;
    this._msg = msg;
  }

  /**
   * HTTP status code for the error
   */
  get status() {
    return this._status;
  }

  /**
   * The error message
   */
  get message() {
    return this._msg;
  }
}

export class COARNotifyServer {
  /**
   * The main entrypoint to the COAR Notify server implementation.
   *
   * The web layer of your application should pass the json/raw payload of any incoming notification to the
   * receive method, which will parse the payload and pass it to the notification_received
   * method of your service implementation.
   *
   * This object should be constructed with your service implementation passed to it.
   *
   * @param {COARNotifyServiceBinding} service_impl - Your service implementation
   */
  constructor(service_impl) {
    this._service_impl = service_impl;
  }

  /**
   * Receive an incoming notification as JSON, parse and validate (optional) and then pass to the
   * service implementation.
   *
   * @param {Object|string} raw - The JSON representation of the data, either as a string or an object
   * @param {boolean} validate - Whether to validate the notification before passing to the service implementation
   * @returns {COARNotifyReceipt} The COARNotifyReceipt response from the service implementation
   */
  receive(raw, validate = true) {
    if (typeof raw === 'string') {
      raw = JSON.parse(raw);
    }

    const obj = COARNotifyFactory.get_by_object(raw);
    if (validate) {
      if (!obj.validate()) {
        throw new COARNotifyServerError(400, 'Invalid notification');
      }
    }

    return this._service_impl.notification_received(obj);
  }
}
