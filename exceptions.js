/**
 * Module for custom exceptions
 */

/**
 * Base class for all exceptions in the coarnotifyjs library
 */
export class NotifyException extends Error {
  constructor(message) {
    super(message);
    this.name = "NotifyException";
  }
}

/**
 * Exception class for validation errors.
 */
export class ValidationError extends NotifyException {
  constructor(errors = {}) {
    super("Validation Error");
    this.name = "ValidationError";
    this._errors = errors;
  }

  get errors() {
    return this._errors;
  }

  addError(key, value) {
    if (!this._errors[key]) {
      this._errors[key] = { errors: [] };
    }
    this._errors[key].errors.push(value);
  }

  addNestedErrors(key, subve) {
    if (!this._errors[key]) {
      this._errors[key] = { errors: [] };
    }
    if (!this._errors[key].nested) {
      this._errors[key].nested = {};
    }
    if (subve && subve.errors && typeof subve.errors === 'object') {
      for (const [k, v] of Object.entries(subve.errors)) {
        this._errors[key].nested[k] = v;
      }
    }
  }

  hasErrors() {
    return Object.keys(this._errors).length > 0;
  }

  toString() {
    return JSON.stringify(this._errors);
  }
}
