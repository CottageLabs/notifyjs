/**
 * Module for custom exceptions
 */

/**
 * Base class for all exceptions in the coarnotifypy library
 * @extends Error
 */
export class NotifyException extends Error {
  constructor(message = "") {
    super(message);
    this.name = "NotifyException";
  }
}

/**
 * Exception class for validation errors.
 *
 * This class is designed to be thrown and caught and to collect validation errors
 * as it passes through the validation pipeline.
 *
 * The errors are stored as a multi-level dictionary with the keys at the top level
 * being the fields in the data structure which have errors, and within the value
 * for each key there are two possible keys:
 *
 * - errors: a list of error messages for this field
 * - nested: a dictionary of further errors for nested fields
 *
 * Example structure:
 * {
 *   "key1": {
 *     "errors": ["error1", "error2"],
 *     "nested": {
 *       "key2": {
 *         errors: ["error3"]
 *       }
 *     }
 *   }
 * }
 */
export class ValidationError extends NotifyException {
  /**
   * @param {Object} [errors={}] A dictionary of errors to construct the exception around
   */
  constructor(errors = {}) {
    super();
    this.name = "ValidationError";
    this._errors = errors;
  }

  /**
   * The dictionary of errors
   * @returns {Object}
   */
  get errors() {
    return this._errors;
  }

  /**
   * Record an error on the supplied key with the message value
   * @param {string} key The key for which an error is to be recorded
   * @param {string} value The error message
   */
  addError(key, value) {
    if (!(key in this._errors)) {
      this._errors[key] = { errors: [] };
    }
    this._errors[key].errors.push(value);
  }

  /**
   * Take an existing ValidationError and add it as a nested set of errors under the supplied key
   * @param {string} key The key under which all the nested validation errors should go
   * @param {ValidationError} subve The existing ValidationError object
   */
  addNestedErrors(key, subve) {
    if (!(key in this._errors)) {
      this._errors[key] = { errors: [] };
    }
    if (!("nested" in this._errors[key])) {
      this._errors[key].nested = {};
    }
    for (const [k, v] of Object.entries(subve.errors)) {
      this._errors[key].nested[k] = v;
    }
  }

  /**
   * Are there any errors registered
   * @returns {boolean}
   */
  hasErrors() {
    return Object.keys(this._errors).length > 0;
  }

  /**
   * String representation of the errors
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this._errors, null, 2);
  }
}
