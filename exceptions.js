/**
 * Module for custom exceptions
 */

/**
 * Base class for all exceptions in the coarnotifyjs library
 */
export class NotifyException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotifyException';
  }
}

/**
 * Exception class for validation errors.
 *
 * This class is designed to be thrown and caught and to collect validation errors
 * as it passes through the validation pipeline.
 *
 * The errors are stored as a multi-level object with the keys at the top level
 * being the fields in the data structure which have errors, and within the value
 * for each key there are two possible keys:
 *
 * - errors: an array of error messages for this field
 * - nested: an object of further errors for nested fields
 *
 * Example structure:
 * {
 *   key1: {
 *     errors: ['error1', 'error2'],
 *     nested: {
 *       key2: {
 *         errors: ['error3']
 *       }
 *     }
 *   }
 * }
 */
export class ValidationError extends NotifyException {
  constructor(errors = {}) {
    super();
    this.name = 'ValidationError';
    this._errors = errors;
  }

  /**
   * Get the dictionary of errors
   */
  get errors() {
    return this._errors;
  }

  /**
   * Record an error on the supplied key with the message value
   * @param {string} key - the key for which an error is to be recorded
   * @param {string} value - the error message
   */
  addError(key, value) {
    if (!this._errors[key]) {
      this._errors[key] = { errors: [] };
    }
    this._errors[key].errors.push(value);
  }

  /**
   * Take an existing ValidationError and add it as a nested set of errors under the supplied key
   * @param {string} key - the key under which all the nested validation errors should go
   * @param {ValidationError} subve - the existing ValidationError object
   */
  addNestedErrors(key, subve) {
    if (!this._errors[key]) {
      this._errors[key] = { errors: [] };
    }
    if (!this._errors[key].nested) {
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

  toString() {
    return JSON.stringify(this._errors);
  }
}
