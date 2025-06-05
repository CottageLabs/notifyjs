/**
 * HTTP layer interface and default implementation using fetch API
 */

export class HttpLayer {
  /**
   * Make an HTTP POST request to the supplied URL with the given body data, and headers
   * @param {string} url - the request URL
   * @param {string} data - the body data
   * @param {Object} headers - HTTP headers as an object to include in the request
   * @param  {...any} args - additional implementation-specific parameters
   * @returns {HttpResponse}
   */
  post(url, data, headers = {}, ...args) {
    throw new Error('NotImplementedError');
  }

  /**
   * Make an HTTP GET request to the supplied URL with the given headers
   * @param {string} url - the request URL
   * @param {Object} headers - HTTP headers as an object to include in the request
   * @param  {...any} args - additional implementation-specific parameters
   * @returns {HttpResponse}
   */
  get(url, headers = {}, ...args) {
    throw new Error('NotImplementedError');
  }
}

export class HttpResponse {
  /**
   * Get the value of a header from the response
   * @param {string} header_name - the name of the header
   * @returns {string}
   */
  header(header_name) {
    throw new Error('NotImplementedError');
  }

  /**
   * Get the status code of the response
   * @returns {number}
   */
  get status_code() {
    throw new Error('NotImplementedError');
  }
}

export class RequestsHttpResponse extends HttpResponse {
  /**
   * Wraps the fetch Response object
   * @param {Response} resp - fetch Response object
   */
  constructor(resp) {
    super();
    this._resp = resp;
  }

  header(header_name) {
    return this._resp.headers.get(header_name);
  }

  get status_code() {
    return this._resp.status;
  }

  get fetch_response() {
    return this._resp;
  }
}

export class RequestsHttpLayer extends HttpLayer {
  /**
   * Make an HTTP POST request using fetch
   * @param {string} url
   * @param {string} data
   * @param {Object} headers
   * @param  {...any} args
   * @returns {Promise<RequestsHttpResponse>}
   */
  async post(url, data, headers = {}, ...args) {
    const resp = await fetch(url, {
      method: 'POST',
      body: data,
      headers: headers,
      ...args,
    });
    return new RequestsHttpResponse(resp);
  }

  /**
   * Make an HTTP GET request using fetch
   * @param {string} url
   * @param {Object} headers
   * @param  {...any} args
   * @returns {Promise<RequestsHttpResponse>}
   */
  async get(url, headers = {}, ...args) {
    const resp = await fetch(url, {
      method: 'GET',
      headers: headers,
      ...args,
    });
    return new RequestsHttpResponse(resp);
  }
}
