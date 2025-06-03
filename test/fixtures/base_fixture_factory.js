class BaseFixtureFactory {
  static source(copy = true) {
    throw new Error('NotImplementedError');
  }

  static invalid() {
    const source = this.source();
    this._base_invalid(source);
    return source;
  }

  static expected_value(path) {
    const source = this.source(false); // no copy needed
    return this._value_from_dict(path, source);
  }

  static _base_invalid(source) {
    source.id = 'not a uri';
    source.inReplyTo = 'not a uri';
    source.origin.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    source.origin.inbox = 'not a uri';
    source.origin.type = 'NotAValidType';
    source.target.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    source.target.inbox = 'not a uri';
    source.target.type = 'NotAValidType';
    source.type = 'NotAValidType';
    return source;
  }

  static _actor_invalid(source) {
    source.actor.id = 'not a uri';
    source.actor.type = 'NotAValidType';
    return source;
  }

  static _object_invalid(source) {
    source.object.id = 'not a uri';
    source.object.cite_as = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    return source;
  }

  static _context_invalid(source) {
    source.context.id = 'not a uri';
    source.context.type = 'NotAValidType';
    source.context.cite_as = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    return source;
  }

  static _value_from_dict(path, dictionary) {
    const bits = path.split('.');
    let node = dictionary;
    for (const bit of bits) {
      node = node[bit];
    }
    return node;
  }
}

module.exports = BaseFixtureFactory;
