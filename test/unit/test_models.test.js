const {
  NotifyPattern,
  NotifyService,
  NotifyObject,
  NotifyActor,
  NotifyItem,
} = require('../../core/notify');
const {
  Accept,
  AnnounceEndorsement,
  AnnounceRelationship,
  AnnounceReview,
  AnnounceServiceResult,
  Reject,
  RequestEndorsement,
  RequestReview,
  TentativelyAccept,
  TentativelyReject,
  UnprocessableNotification,
  UndoOffer,
} = require('../../patterns');
const { NotifyFixtureFactory } = require('../fixtures/notify');
const {
  AcceptFixtureFactory,
  AnnounceEndorsementFixtureFactory,
  AnnounceRelationshipFixtureFactory,
  AnnounceReviewFixtureFactory,
  AnnounceServiceResultFixtureFactory,
  RejectFixtureFactory,
  RequestEndorsementFixtureFactory,
  RequestReviewFixtureFactory,
  TentativelyAcceptFixtureFactory,
  TentativelyRejectFixtureFactory,
  UnprocessableNotificationFixtureFactory,
  UndoOfferFixtureFactory,
} = require('../fixtures');

describe('TestModels', () => {
  function getTestableProperties(source, propMap = null) {
    function expand(node, path) {
      let paths = [];
      for (const [k, v] of Object.entries(node)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          paths = paths.concat(expand(v, `${path}.${k}`));
        } else {
          paths.push(`${path}.${k}`);
        }
      }
      paths = paths
        .filter((p) => !p.includes('@context'))
        .map((p) => (p.startsWith('.') ? p.slice(1) : p));
      return paths;
    }

    const objProperties = expand(source, '');

    if (!propMap) {
      propMap = {
        'inReplyTo': 'in_reply_to',
        'context.ietf:cite-as': 'context.cite_as',
        'context.ietf:item.id': 'context.item.id',
        'context.ietf:item.mediaType': 'context.item.media_type',
        'context.ietf:item.type': 'context.item.type',
        'object.as:subject': 'object.triple[2]',
        'object.as:relationship': 'object.triple[1]',
        'object.as:object': 'object.triple[0]',
        'object.ietf:cite-as': 'object.cite_as',
        'object.ietf:item.id': 'object.item.id',
        'object.ietf:item.mediaType': 'object.item.media_type',
        'object.ietf:item.type': 'object.item.type',
        'object.object.ietf:cite-as': 'object.object.cite_as',
        'object.object.ietf:item.id': 'object.object.item.id',
        'object.object.ietf:item.mediaType': 'object.object.item.media_type',
        'object.object.ietf:item.type': 'object.object.item.type',
      };
    }

    return objProperties.map((p) => (propMap[p] ? [propMap[p], p] : p));
  }

  function applyPropertyTest(proptest, obj, fixtures) {
    function getProp(source, prop) {
      let p = prop;
      if (Array.isArray(prop)) {
        p = prop[1];
      }
      const bits = p.split('.');
      let current = source;
      for (const bit of bits) {
        let key = bit;
        let idx = null;
        if (bit.includes('[')) {
          [key, idx] = bit.split('[');
          idx = parseInt(idx.slice(0, -1), 10);
        }
        current = current[key];
        if (idx !== null) {
          current = current[idx];
        }
      }
      return current;
    }

    for (const prop of proptest) {
      let oprop, fprop;
      if (Array.isArray(prop)) {
        [oprop, fprop] = prop;
      } else {
        oprop = fprop = prop;
      }

      const oval = getProp(obj, oprop);
      const evalVal = fixtures.expected_value(fprop);

      const ovalVal = Array.isArray(oval) && oval.length === 1 ? oval[0] : oval;
      const evalValNorm = Array.isArray(evalVal) && evalVal.length === 1 ? evalVal[0] : evalVal;

      expect(ovalVal).toEqual(evalValNorm);
    }
  }

  test('01 notify manual construct', () => {
    const n = new NotifyPattern();

    expect(n.id).toBeDefined();
    expect(n.id.startsWith('urn:uuid:')).toBe(true);
    expect(n.type).toBe(NotifyPattern.TYPE);
    expect(n.origin).toBeNull();
    expect(n.target).toBeNull();
    expect(n.object).toBeNull();
    expect(n.actor).toBeNull();
    expect(n.in_reply_to).toBeNull();
    expect(n.context).toBeNull();

    n.id = 'urn:whatever';
    n.ALLOWED_TYPES = ['Object', 'Other']; // hack to test setter
    n.type = 'Other';

    const origin = new NotifyService();
    expect(origin.id).toBeDefined();
    expect(origin.type).toBe(origin.DEFAULT_TYPE);
    origin.inbox = 'http://origin.com/inbox';
    n.origin = origin;

    const target = new NotifyService();
    target.inbox = 'http://target.com/inbox';
    n.target = target;

    const obj = new NotifyObject();
    expect(obj.id).toBeDefined();
    expect(obj.type).toBeNull();
    n.object = obj;

    const actor = new NotifyActor();
    expect(actor.id).toBeDefined();
    expect(actor.type).toBe(actor.DEFAULT_TYPE);
    n.actor = actor;

    n.in_reply_to = 'urn:irt';

    const context = new NotifyObject();
    expect(context.id).toBeDefined();
    expect(context.type).toBeNull();
    n.context = context;

    expect(n.id).toBe('urn:whatever');
    expect(n.type).toBe('Other');
    expect(n.origin.id).toBe(origin.id);
    expect(n.origin.type).toBe(origin.DEFAULT_TYPE);
    expect(n.origin.inbox).toBe('http://origin.com/inbox');
    expect(n.target.id).toBe(target.id);
    expect(n.target.type).toBe(target.DEFAULT_TYPE);
    expect(n.target.inbox).toBe('http://target.com/inbox');
    expect(n.object.id).toBe(obj.id);
    expect(n.object.type).toBeNull();
    expect(n.actor.id).toBe(actor.id);
    expect(n.actor.type).toBe(actor.DEFAULT_TYPE);
    expect(n.in_reply_to).toBe('urn:irt');
    expect(n.context.id).toBe(context.id);
    expect(n.context.type).toBeNull();
  });

  test('02 notify from fixture', () => {
    const source = NotifyFixtureFactory.source();
    const n = new NotifyPattern(source);

    expect(n.id).toBe(source.id);
    expect(n.type).toBe(source.type);
    expect(n.origin).toBeInstanceOf(NotifyService);
    expect(n.origin.id).toBe(source.origin.id);
    expect(n.object).toBeInstanceOf(NotifyObject);
    expect(n.object.id).toBe(source.object.id);
    expect(n.target).toBeInstanceOf(NotifyService);
    expect(n.target.id).toBe(source.target.id);
    expect(n.actor).toBeInstanceOf(NotifyActor);
    expect(n.actor.id).toBe(source.actor.id);
    expect(n.in_reply_to).toBe(source.inReplyTo);
    expect(n.context).toBeInstanceOf(NotifyObject);
    expect(n.context.id).toBe(source.context.id);
    expect(n.context.item).toBeInstanceOf(NotifyItem);
    expect(n.context.item.id).toBe(source.context['ietf:item'].id);

    n.id = 'urn:whatever';
    n.ALLOWED_TYPES = ['Object', 'Other']; // hack to test setter
    n.type = 'Other';
    expect(n.id).toBe('urn:whatever');
    expect(n.type).toBe('Other');
  });

  test('03 notify operations', () => {
    const n = new NotifyPattern();
    expect(() => n.validate()).toThrow();
    expect(n.to_jsonld()).toBeDefined();

    const source = NotifyFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const n2 = new NotifyPattern(source);
    expect(n2.validate()).toBe(true);
    expect(n2.to_jsonld()).toEqual(compare);
  });

  test('04 accept', () => {
    const a = new Accept();

    const source = AcceptFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const a2 = new Accept(source);
    expect(a2.validate()).toBe(true);
    expect(a2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, a2, AcceptFixtureFactory);
  });

  test('05 announce endorsement', () => {
    const ae = new AnnounceEndorsement();

    const source = AnnounceEndorsementFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ae2 = new AnnounceEndorsement(source);
    expect(ae2.validate()).toBe(true);
    expect(ae2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ae2, AnnounceEndorsementFixtureFactory);
  });

  test('07 announce relationship', () => {
    const ae = new AnnounceRelationship();

    const source = AnnounceRelationshipFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ae2 = new AnnounceRelationship(source);
    expect(ae2.validate()).toBe(true);
    expect(ae2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ae2, AnnounceRelationshipFixtureFactory);
  });

  test('08 announce review', () => {
    const ar = new AnnounceReview();

    const source = AnnounceReviewFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ar2 = new AnnounceReview(source);
    expect(ar2.validate()).toBe(true);
    expect(ar2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ar2, AnnounceReviewFixtureFactory);
  });

  test('09 announce service result', () => {
    const asr = new AnnounceServiceResult();

    const source = AnnounceServiceResultFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    compare.type = compare.type[0]; // because it's a single field, but is a list in the fixture
    const asr2 = new AnnounceServiceResult(source);

    expect(asr2.validate()).toBe(true);
    expect(asr2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, asr2, AnnounceServiceResultFixtureFactory);
  });

  test('10 reject', () => {
    const rej = new Reject();

    const source = RejectFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const rej2 = new Reject(source);

    expect(rej2.validate()).toBe(true);
    expect(rej2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, rej2, RejectFixtureFactory);
  });

  test('11 request endorsement', () => {
    const re = new RequestEndorsement();

    const source = RequestEndorsementFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const re2 = new RequestEndorsement(source);

    expect(re2.validate()).toBe(true);
    expect(re2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, re2, RequestEndorsementFixtureFactory);
  });

  test('13 request review', () => {
    const ri = new RequestReview();

    const source = RequestReviewFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ri2 = new RequestReview(source);

    expect(ri2.validate()).toBe(true);
    expect(ri2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ri2, RequestReviewFixtureFactory);
  });

  test('14 tentatively accept', () => {
    const ta = new TentativelyAccept();

    const source = TentativelyAcceptFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ta2 = new TentativelyAccept(source);

    expect(ta2.validate()).toBe(true);
    expect(ta2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ta2, TentativelyAcceptFixtureFactory);
  });

  test('15 tentatively reject', () => {
    const ta = new TentativelyReject();

    const source = TentativelyRejectFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ta2 = new TentativelyReject(source);

    expect(ta2.validate()).toBe(true);
    expect(ta2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ta2, TentativelyRejectFixtureFactory);
  });

  test('16 unprocessable notification', () => {
    const ta = new UnprocessableNotification();

    const source = UnprocessableNotificationFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ta2 = new UnprocessableNotification(source);

    expect(ta2.validate()).toBe(true);
    expect(ta2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ta2, UnprocessableNotificationFixtureFactory);
  });

  test('17 undo offer', () => {
    const ta = new UndoOffer();

    const source = UndoOfferFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ta2 = new UndoOffer(source);

    expect(ta2.validate()).toBe(true);
    expect(ta2.to_jsonld()).toEqual(compare);

    const proptest = getTestableProperties(compare);
    applyPropertyTest(proptest, ta2, UndoOfferFixtureFactory);
  });

  test('18 by ref', () => {
    const n = new NotifyPattern({ properties_by_reference: true });

    const obj = new NotifyObject();
    expect(obj.id).not.toBe('urn:whatever');

    n.object = obj;
    n.object.id = 'urn:whatever';
    expect(n.object.id).toBe('urn:whatever');
    expect(obj.id).toBe('urn:whatever');

    const source = RequestReviewFixtureFactory.source();
    const n2 = new RequestReview(source, { properties_by_reference: true });
    const obj2 = n2.object;
    obj2.id = 'urn:whatever';
    expect(n2.object.id).toBe('urn:whatever');
  });

  test('19 by value', () => {
    const n = new NotifyPattern({ properties_by_reference: false });

    const obj = new NotifyObject();
    expect(obj.id).not.toBe('urn:whatever');

    n.object = obj;
    obj.id = 'urn:whatever';
    expect(n.object.id).not.toBe('urn:whatever');
    expect(obj.id).toBe('urn:whatever');

    const source = RequestReviewFixtureFactory.source();
    const n2 = new RequestReview(source, { properties_by_reference: false });
    const obj2 = n2.object;
    obj2.id = 'urn:whatever';
    expect(n2.object.id).not.toBe('urn:whatever');
  });
});
