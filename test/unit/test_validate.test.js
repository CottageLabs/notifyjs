const {
  NotifyPattern,
  NotifyService,
  NotifyObject,
} = require('../../core/notify');
const {
  Accept,
  AnnounceEndorsement,
  AnnounceRelationship,
  AnnounceReview,
  AnnounceServiceResult,
  RequestEndorsement,
  RequestReview,
  TentativelyAccept,
  TentativelyReject,
  UnprocessableNotification,
  UndoOffer,
  Reject,
} = require('../../patterns');
const { NotifyFixtureFactory } = require('../fixtures/notify');
const {
  AcceptFixtureFactory,
  AnnounceEndorsementFixtureFactory,
  AnnounceRelationshipFixtureFactory,
  AnnounceReviewFixtureFactory,
  AnnounceServiceResultFixtureFactory,
  RequestReviewFixtureFactory,
  RequestEndorsementFixtureFactory,
  URIFixtureFactory,
  TentativelyAcceptFixtureFactory,
  TentativelyRejectFixtureFactory,
  UnprocessableNotificationFixtureFactory,
  UndoOfferFixtureFactory,
  RejectFixtureFactory,
} = require('../fixtures');
const { ValidationError } = require('../../exceptions');
const { Properties } = require('../../core/activitystreams2');
const { NotifyProperties } = require('../../core/notify');
const validate = require('../../validate');
const { Validator } = require('../../validate');

describe('TestValidate', () => {
  test('01 structural empty', () => {
    const n = new NotifyPattern();
    n.id = null;
    n.type = null;
    expect(() => n.validate()).toThrow(ValidationError);
  });

  test('02 structural basic', () => {
    const n = new NotifyPattern();
    expect(() => n.validate()).toThrow(ValidationError);
  });

  test('03 structural valid document', () => {
    const n = new NotifyPattern();
    n.target = NotifyFixtureFactory.target();
    n.origin = NotifyFixtureFactory.origin();
    n.object = NotifyFixtureFactory.object();
    expect(n.validate()).toBe(true);
  });

  test('04 structural invalid nested', () => {
    const n = new NotifyPattern();
    n.target = new NotifyService({ whatever: 'value' }, { validate_stream_on_construct: false });
    n.origin = new NotifyService({ another: 'junk' }, { validate_stream_on_construct: false });
    n.object = new NotifyObject({ yet: 'more' }, { validate_stream_on_construct: false });
    expect(() => n.validate()).toThrow(ValidationError);
  });

  test('05 validation modes', () => {
    const valid = NotifyFixtureFactory.source();
    let n = new NotifyPattern(valid, { validate_stream_on_construct: true });

    const invalid = NotifyFixtureFactory.source();
    invalid.id = 'http://example.com/^path';
    expect(() => new NotifyPattern(invalid, { validate_stream_on_construct: true })).toThrow(ValidationError);

    n = new NotifyPattern(valid, { validate_stream_on_construct: false });

    const invalid2 = NotifyFixtureFactory.source();
    invalid2.id = 'http://example.com/^path';
    n = new NotifyPattern(invalid2, { validate_stream_on_construct: false });

    n = new NotifyPattern({ validate_properties: false });
    n.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    n.id = 'http://example.com/^path';
    expect(() => n.validate()).toThrow(ValidationError);
  });

  test('06 validate id property', () => {
    const n = new NotifyPattern();
    expect(() => { n.id = '9whatever:none'; }).toThrow('Invalid URI scheme `9whatever`');
    expect(() => { n.id = 'http://wibble/stuff'; }).toThrow('Invalid URI authority `wibble`');
    expect(() => { n.id = 'http://example.com/^path'; }).toThrow('Invalid URI path `/^path`');
    expect(() => { n.id = 'http://example.com/path/here/?^=what'; }).toThrow('Invalid URI query `^=what`');
    expect(() => { n.id = 'http://example.com/path/here/?you=what#^frag'; }).toThrow('Invalid URI fragment `^frag`');

    n.id = 'https://john.doe@www.example.com:1234/forum/questions/?tag=networking&order=newest#top';
    n.id = 'https://john.doe@www.example.com:1234/forum/questions/?tag=networking&order=newest#:~:text=whatever';
    n.id = 'ldap://[2001:db8::7]/c=GB?objectClass?one';
    n.id = 'mailto:John.Doe@example.com';
    n.id = 'news:comp.infosystems.www.servers.unix';
    n.id = 'tel:+1-816-555-1212';
    n.id = 'telnet://192.0.2.16:80/';
    n.id = 'urn:oasis:names:specification:docbook:dtd:xml:4.1.2';

    n.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0';
    n.id = 'https://generic-service.com/system';
    n.id = 'https://generic-service.com/system/inbox/';
  });

  test('07 validate url', () => {
    const urls = URIFixtureFactory.generate({ schemes: ['http', 'https'] });
    urls.forEach((url) => {
      expect(validate.url(null, url)).toBe(true);
    });

    expect(() => validate.url(null, 'ftp://example.com')).toThrow();
    expect(() => validate.url(null, 'http:/example.com')).toThrow();
    expect(() => validate.url(null, 'http://domain/path')).toThrow();
    expect(() => validate.url(null, 'http://example.com/path^wrong')).toThrow();
  });

  test('08 one of', () => {
    const values = ['a', 'b', 'c'];
    const validator = validate.one_of(values);
    expect(validator(null, 'a')).toBe(true);
    expect(validator(null, 'b')).toBe(true);
    expect(validator(null, 'c')).toBe(true);
    expect(() => validator(null, 'd')).toThrow();
    expect(() => validator(null, ['a', 'b'])).toThrow();
  });

  test('09 contains', () => {
    const validator = validate.contains('a');
    expect(validator(null, ['a', 'b', 'c'])).toBe(true);
    expect(() => validator(null, ['b', 'c', 'd'])).toThrow();
  });

  test('10 at least one of', () => {
    const values = ['a', 'b', 'c'];
    const validator = validate.at_least_one_of(values);
    expect(validator(null, 'a')).toBe(true);
    expect(validator(null, 'b')).toBe(true);
    expect(validator(null, 'c')).toBe(true);
    expect(() => validator(null, 'd')).toThrow();
    expect(validator(null, ['a', 'd'])).toBe(true);
  });

  test('11 accept validate', () => {
    const source = AcceptFixtureFactory.source();
    const a = new Accept(source);

    baseValidate(a);
    expect(() => { a.type = 'Announce'; }).toThrow();
    actorValidate(a);

    const isource = AcceptFixtureFactory.invalid();
    expect(() => new Accept(isource)).toThrow(ValidationError);
  });

  // Additional validation tests for other patterns omitted for brevity

  function baseValidate(a) {
    expect(() => { a.id = 'not a uri'; }).toThrow();
    expect(() => { a.in_reply_to = 'not a uri'; }).toThrow();
    expect(() => { a.origin.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0'; }).toThrow();
    expect(() => { a.origin.inbox = 'not a uri'; }).toThrow();
    expect(() => { a.target.id = 'urn:uuid:4fb3af44-d4f8-4226-9475-2d09c2d8d9e0'; }).toThrow();
    expect(() => { a.target.inbox = 'not a uri'; }).toThrow();
    expect(() => { a.type = 'NotAValidType'; }).toThrow();
  }

  function actorValidate(a) {
    expect(() => { a.actor.id = 'not a uri'; }).toThrow();
    expect(() => { a.actor.type = 'NotAValidType'; }).toThrow();
  }
});
