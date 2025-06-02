/**
 * HTTP layer interface and default implementation using fetch API
 */

/**
 * Interface for the HTTP layer
 *
 * This defines the methods which need to be implemented in order for the client to fully operate
 */
export class HttpLayer {
  /**
   * Make an HTTP POST request to the supplied URL with the given body data, and headers
   *
   * @param {string} url The request URL
   * @param {string} data The body data
   * @param {Object} [headers={}] HTTP headers as a dict to include in the request
   * @param  {...any} args Additional arguments
   * @returns {Promise<HttpResponse>}
   */
  async post(url, data, headers = {}, ...args) {
    throw new Error("Not implemented");
  }

  /**
   * Make an HTTP GET request to the supplied URL with the given headers
   *
   * @param {string} url The request URL
   * @param {Object} [headers={}] HTTP headers as a dict to include in the request
   * @param  {...any} args Additional arguments
   * @returns {Promise<HttpResponse>}
   */
  async get(url, headers = {}, ...args) {
    throw new Error("Not implemented");
  }
}

/**
 * Interface for the HTTP response object
 *
 * This defines the methods which need to be implemented in order for the client to fully operate
 */
export class HttpResponse {
  /**
   * Get the value of a header from the response
   *
   * @param {string} headerName The name of the header
   * @returns {string|null}
   */
  header(headerName) {
    throw new Error("Not implemented");
  }

  /**
   * Get the status code of the response
   *
   * @returns {number}
   */
  get statusCode() {
    throw new Error("Not implemented");
  }
}

/**
 * Implementation of the HTTP layer using the fetch API. This is the default implementation
 * used when no other implementation is supplied
 */
export class RequestsHttpLayer extends HttpLayer {
  /**
   * Make an HTTP POST request to the supplied URL with the given body data, and headers
   *
   * @param {string} url The request URL
   * @param {string} data The body data
   * @param {Object} [headers={}] HTTP headers as a dict to include in the request
   * @param  {...any} args Additional arguments (ignored)
   * @returns {Promise<RequestsHttpResponse>}
   */
  async post(url, data, headers = {}, ...args) {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
      ...args,
    });
    return new RequestsHttpResponse(response);
  }

  /**
   * Make an HTTP GET request to the supplied URL with the given headers
   *
   * @param {string} url The request URL
   * @param {Object} [headers={}] HTTP headers as a dict to include in the request
   * @param  {...any} args Additional arguments (ignored)
   * @returns {Promise<RequestsHttpResponse>}
   */
  async get(url, headers = {}, ...args) {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      ...args,
    });
    return new RequestsHttpResponse(response);
  }
}

/**
 * Implementation of the HTTP response object using the fetch API Response object
 *
 * This wraps the fetch Response object and provides the interface required by the client
 */
export class RequestsHttpResponse extends HttpResponse {
  /**
   * Construct the object as a wrapper around the original fetch Response object
   *
   * @param {Response} response The fetch Response object
   */
  constructor(response) {
    super();
    this._response = response;
  }

  /**
   * Get the value of a header from the response
   *
   * @param {string} headerName The name of the header
   * @returns {string|null}
   */
  header(headerName) {
    return this._response.headers.get(headerName);
  }

  /**
   * Get the status code of the response
   *
   * @returns {number}
   */
  get statusCode() {
    return this._response.status;
  }

  /**
   * Get the original fetch Response object
   *
   * @returns {Response}
   */
  get fetchResponse() {
    return this._response;
  }
}
