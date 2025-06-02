/**
 * This module provides a set of validation functions that can be used to validate properties on objects.
 * It also contains a `Validator` class which is used to wrap the protocol-wide validation rules
 * which are shared across all objects.
 */

import { URL } from "url";

export const REQUIRED_MESSAGE = "`{x}` is a required field";

export class Validator {
  /**
   * A wrapper around a set of validation rules which can be used to select the appropriate validator
   * in a given context.
   *
   * The validation rules are structured as follows:
   *
   * {
   *   "<property>": {
   *     default: defaultValidatorFunction,
   *     context: {
   *       "<context>": {
   *         default: defaultValidatorFunction
   *       }
   *     }
   *   }
   * }
   *
   * @param {Object} rules - The rules to use for validation
   */
  constructor(rules) {
    this._rules = rules;
  }

  /**
   * Get the validation function for the given property in the given context
   *
   * @param {string|string[]} property - The property to get the validation function for (string or tuple)
   * @param {string|string[]=} context - The context in which the property is being validated
   * @returns {Function|null} - A function which can be used to validate the property or null
   */
  get(property, context = null) {
    const ruleEntry = this._rules[property] || {};
    const defaultValidator = ruleEntry.default ?? null;

    if (context !== null) {
      const specific = ruleEntry.context?.[context]?.default ?? null;
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
   * Add new rules, merging recursively with existing rules
   * @param {Object} rules
   */
  addRules(rules) {
    const mergeDictsRecursive = (dict1, dict2) => {
      const merged = { ...dict1 };
      for (const [key, value] of Object.entries(dict2)) {
        if (
          key in merged &&
          typeof merged[key] === "object" &&
          !Array.isArray(merged[key]) &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          merged[key] = mergeDictsRecursive(merged[key], value);
        } else {
          merged[key] = value;
        }
      }
      return merged;
    };

    this._rules = mergeDictsRecursive(this.rules(), rules);
  }
}

/* ############ URI Validator Constants & Regex ############ */

const URI_RE = /^(([^:/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+\-.]*$/;
const IPv6 =
  /(?:^|(?<=\s))\[{0,1}(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))]{0,1}(?=\s|$)/;

const HOSTPORT = new RegExp(
  [
    "^(",
    // domain
    "(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\\.)+(?:[A-Z]{2,6}\\.?|[A-Z0-9-]{2,}\\.?)|",
    // localhost
    "localhost|",
    // ipv4
    "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|",
    // ipv6 (copied from above pattern)
    "(?:^|(?<=\\s))(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(?=\\s|$)",
    ")",
    "(?::\\d+)?$", // optional port
  ].join(""),
  "i"
);

const MARK = "-_.!~*'()";
const UNRESERVED = "a-zA-Z0-9" + MARK;
const PCHARS = UNRESERVED + ":@&=+$," + "%/;";
const PATH = new RegExp(`^/{0,1}[${PCHARS}]*$`);

const RESERVED = ";/?:@&=+$,";
const URIC = RESERVED + UNRESERVED + "%";
const FREE = new RegExp(`^[${URIC}]+$`);

const USERINFO = new RegExp(`^[${UNRESERVED}%;:&=+$,]*$`);

/**
 * Validate that the given string is an absolute URI
 * @param {any} obj - The object to which the property belongs (unused in validation logic)
 * @param {string} uri - The string that claims to be an absolute URI
 * @returns {boolean}
 * @throws {Error} Throws ValueError (Error) if URI is invalid
 */
export function absolute_uri(obj, uri) {
  const m = uri.match(URI_RE);
  if (!m) {
    throw new Error("Invalid URI");
  }

  // URI must be absolute, so requires a scheme
  if (m[2] == null) {
    throw new Error(
      "URI requires a scheme (this may be a relative rather than absolute URI)"
    );
  }

  const scheme = m[2];
  const authority = m[4];
  const path = m[5];
  const query = m[7];
  const fragment = m[9];

  // Validate scheme
  if (scheme !== null && !SCHEME.test(scheme)) {
    throw new Error(`Invalid URI scheme \`${scheme}\``);
  }

  if (authority !== null) {
    let userinfo = null;
    let hostport = authority;

    if (authority.includes("@")) {
      [userinfo, hostport] = authority.split("@", 2);
    }

    if (userinfo !== null && !USERINFO.test(userinfo)) {
      throw new Error(`Invalid URI authority \`${authority}\``);
    }

    if (hostport.startsWith("[")) {
      // IPv6 with optional port
      const portSeparator = hostport.lastIndexOf("]:");
      let port = null;
      let host;

      if (portSeparator !== -1) {
        port = hostport.slice(portSeparator + 2);
        host = hostport.slice(1, portSeparator);
      } else {
        host = hostport.slice(1, -1);
      }

      if (!IPv6.test(host)) {
        throw new Error(`Invalid URI authority \`${authority}\``);
      }

      if (port !== null) {
        if (isNaN(Number(port))) {
          throw new Error(`Invalid URI port \`${port}\``);
        }
      }
    } else {
      if (!HOSTPORT.test(hostport)) {
        throw new Error(`Invalid URI authority \`${authority}\``);
      }
    }
  }

  if (path !== null && !PATH.test(path)) {
    throw new Error(`Invalid URI path \`${path}\``);
  }

  if (query !== null && !FREE.test(query)) {
    throw new Error(`Invalid URI query \`${query}\``);
  }

  if (fragment !== null && !FREE.test(fragment)) {
    throw new Error(`Invalid URI fragment \`${fragment}\``);
  }

  return true;
}

/**
 * Validate that the given string is an absolute HTTP URI (i.e. a URL)
 * @param {any} obj - The object to which the property belongs (unused in validation logic)
 * @param {string} url - The string that claims to be an HTTP URI
 * @returns {boolean}
 * @throws {Error} Throws ValueError (Error) if URL is invalid
 */
export function url(obj, url) {
  absolute_uri(obj, url);
  let o;
  try {
    o = new URL(url);
  } catch {
    throw new Error("Does not appear to be a valid URL");
  }

  if (o.protocol !== "http:" && o.protocol !== "https:") {
    throw new Error("URL scheme must be http or https");
  }

  if (!o.hostname) {
    throw new Error("Does not appear to be a valid URL");
  }
  return true;
}

/**
 * Closure that returns a validation function that checks that the value is one of the given values
 * @param {string[]} values - The list of valid values
 * @returns {Function} Validation function (obj, x) => boolean
 */
export function one_of(values) {
  return function validate(obj, x) {
    if (!values.includes(x)) {
      throw new Error(
        `\`${x}\` is not one of the valid values: ${JSON.stringify(values)}`
      );
    }
    return true;
  };
}

/**
 * Closure that returns a validation function that checks that a list of values contains at least one
 * of the given values
 * @param {string[]} values - The list of valid values
 * @returns {Function} Validation function (obj, x) => boolean
 */
export function at_least_one_of(values) {
  return function validate(obj, x) {
    if (!Array.isArray(x)) {
      x = [x];
    }

    for (const entry of x) {
      if (values.includes(entry)) {
        return true;
      }
    }

    throw new Error(
      `\`${JSON.stringify(
        x
      )}\` does not contain any of the valid values: ${JSON.stringify(values)}`
    );
  };
}

/**
 * Closure that returns a validation function that checks the provided values contain the required value(s)
 * @param {string|string[]} value - The required value(s)
 * @returns {Function} Validation function (obj, x) => boolean
 */
export function contains(value) {
  let values = Array.isArray(value) ? value : [value];
  values = new Set(values);

  return function validate(obj, x) {
    if (!Array.isArray(x)) {
      x = [x];
    }
    const xSet = new Set(x);
    for (const v of values) {
      if (!xSet.has(v)) {
        throw new Error(
          `\`${JSON.stringify(x)}\` does not contain required value \`${v}\``
        );
      }
    }
    return true;
  };
}

/**
 * Closure that returns a validation function that checks the type of a value.
 * @param {string} typeName - The name of the type: "str", "int", "bool", "float", "dict", "list"
 * @returns {Function} Validation function (obj, x) => boolean
 */
export function type_checker(typeName) {
  return function validate(obj, x) {
    switch (typeName) {
      case "str":
        if (typeof x !== "string") {
          throw new Error(`\`${x}\` is not a string`);
        }
        break;
      case "int":
        if (!Number.isInteger(x)) {
          throw new Error(`\`${x}\` is not an integer`);
        }
        break;
      case "bool":
        if (typeof x !== "boolean") {
          throw new Error(`\`${x}\` is not a boolean`);
        }
        break;
      case "float":
        if (typeof x !== "number" || Number.isNaN(x)) {
          throw new Error(`\`${x}\` is not a float`);
        }
        break;
      case "dict":
        if (typeof x !== "object" || x === null || Array.isArray(x)) {
          throw new Error(`\`${x}\` is not an object`);
        }
        break;
      case "list":
        if (!Array.isArray(x)) {
          throw new Error(`\`${x}\` is not a list`);
        }
        break;
      default:
        throw new Error(`Unknown type \`${typeName}\``);
    }
    return true;
  };
}
