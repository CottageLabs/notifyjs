/**
 * This module provides a set of validation functions that can be used to validate properties on objects.
 * It also contains a Validator class which is used to wrap the protocol-wide validation rules which
 * are shared across all objects.
 */

const { URL } = require('url');

const REQUIRED_MESSAGE = "\`{x}\` is a required field";

class Validator {
  /**
   * Create a new validator with the given rules
   * @param {Object} rules - The rules to use for validation
   */
  constructor(rules) {
    this._rules = rules;
  }

  /**
   * Get the validation function for the given property in the given context
   * @param {string|Array} property - the property to get the validation function for
   * @param {string|Array} [context] - the context in which the property is being validated
   * @returns {Function|null} a function which can be used to validate the property
   */
  get(property, context = null) {
    const propRules = this._rules[property] || {};
    const defaultValidator = propRules.default || null;
    if (context !== null) {
      const specific = (propRules.context && propRules.context[context] && propRules.context[context].default) || null;
      if (specific !== null) {
        return specific;
      }
    }
    return defaultValidator;
  }

  /**
   * The ruleset for this validator
   * @returns {Object}
   */
  rules() {
    return this._rules;
  }

  /**
   * Add rules to the existing ruleset, merging recursively
   * @param {Object} rules
   */
  addRules(rules) {
    const mergeDictsRecursive = (dict1, dict2) => {
      const merged = { ...dict1 };
      for (const [key, value] of Object.entries(dict2)) {
        if (merged.hasOwnProperty(key) && typeof merged[key] === 'object' && typeof value === 'object' && !Array.isArray(merged[key]) && !Array.isArray(value)) {
          merged[key] = mergeDictsRecursive(merged[key], value);
        } else {
          merged[key] = value;
        }
      }
      return merged;
    };
    this._rules = mergeDictsRecursive(this._rules, rules);
  }
}

/**
 * Validate that the given string is an absolute URI
 * @param {Object} obj - The Notify object to which the property being validated belongs.
 * @param {string} uri - The string that claims to be an absolute URI
 * @returns {boolean} true if valid, otherwise throws Error
 */
function absolute_uri(obj, uri) {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch (e) {
    throw new Error("Invalid URI");
  }

  if (!parsed.protocol) {
    throw new Error("URI requires a scheme (this may be a relative rather than absolute URI)");
  }

  // Additional validation for authority, path, query, fragment can be added here if needed

  return true;
}

/**
 * Validate that the given string is an absolute HTTP URI (i.e. a URL)
 * @param {Object} obj - The Notify object to which the property being validated belongs.
 * @param {string} url - The string that claims to be an HTTP URI
 * @returns {boolean} true if valid, otherwise throws Error
 */
function url(obj, url) {
  absolute_uri(obj, url);
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL scheme must be http or https");
  }
  if (!parsed.hostname) {
    throw new Error("Does not appear to be a valid URL");
  }
  return true;
}

/**
 * Closure that returns a validation function that checks that the value is one of the given values
 * @param {Array<string>} values - The list of values to choose from
 * @returns {Function} validation function
 */
function one_of(values) {
  return function validate(obj, x) {
    if (!values.includes(x)) {
      throw new Error(`\`${x}\` is not one of the valid values: ${values}`);
    }
    return true;
  };
}

/**
 * Closure that returns a validation function that checks that a list of values contains at least one of the given values
 * @param {Array<string>} values - The list of values to choose from
 * @returns {Function} validation function
 */
function at_least_one_of(values) {
  return function validate(obj, x) {
    if (!Array.isArray(x)) {
      x = [x];
    }
    for (const entry of x) {
      if (values.includes(entry)) {
        return true;
      }
    }
    throw new Error(`\`${x}\` is not one of the valid values: ${values}`);
  };
}

/**
 * Closure that returns a validation function that checks the provided values contain the required value
 * @param {string} value - The value that must be present
 * @returns {Function} validation function
 */
function contains(value) {
  let values = value;
  if (!Array.isArray(values)) {
    values = [values];
  }
  const valuesSet = new Set(values);

  return function validate(obj, x) {
    if (!Array.isArray(x)) {
      x = [x];
    }
    const xSet = new Set(x);
    for (const val of valuesSet) {
      if (!xSet.has(val)) {
        throw new Error(`\`${x}\` does not contain the required value(s): ${values}`);
      }
    }
    return true;
  };
}

/**
 * Validate that the given value is of the correct type for the object.
 * @param {Object} obj - the notify object being validated
 * @param {*} value - the type being validated
 * @returns {boolean} true if valid, otherwise throws Error
 */
function type_checker(obj, value) {
  if (obj.ALLOWED_TYPES && obj.ALLOWED_TYPES.length > 0) {
    const validator = one_of(obj.ALLOWED_TYPES);
    validator(obj, value);
  } else if (obj.TYPE) {
    const validator = contains(obj.TYPE);
    validator(obj, value);
  }
  return true;
}

module.exports = {
  Validator,
  absolute_uri,
  url,
  one_of,
  at_least_one_of,
  contains,
  type_checker,
  REQUIRED_MESSAGE,
};
