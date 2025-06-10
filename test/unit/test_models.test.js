import { describe, it, expect } from "vitest";
import {
  NotifyPattern,
  NotifyService,
  NotifyObject,
  NotifyActor,
  NotifyItem,
  ValidationError,
} from "../../core/notify.js";
import { NotifyFixtureFactory } from "../fixtures/notify.js";
import {
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
} from "../../patterns/index.js";
import {
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
} from "../fixtures/index.js";

describe("NotifyPattern", () => {
  it("should construct with default values", () => {
    const n = new NotifyPattern();

    expect(n.id).toMatch(/^urn:uuid:[0-9a-f]{32}$/);
    expect(n.type).toBe("Object");
    expect(n.origin).toBeNull();
    expect(n.target).toBeNull();
    expect(n.object).toBeNull();
    expect(n.actor).toBeNull();
    expect(n.in_reply_to).toBeNull();
    expect(n.context).toBeNull();
  });

  it("should set and get properties", () => {
    const n = new NotifyPattern();

    n.id = "urn:whatever";
    n.ALLOWED_TYPES = ["Object", "Other"];
    n.type = "Other";

    const origin = new NotifyService();
    expect(origin.id).toMatch(/^urn:uuid:[0-9a-f]{32}$/);
    expect(origin.type).toBe("Service");
    origin.inbox = "http://origin.com/inbox";
    n.origin = origin;

    const target = new NotifyService();
    target.inbox = "http://target.com/inbox";
    n.target = target;

    const obj = new NotifyObject();
    expect(obj.id).toMatch(/^urn:uuid:[0-9a-f]{32}$/);
    expect(obj.type).toBeNull();
    n.object = obj;

    const actor = new NotifyActor();
    expect(actor.id).toMatch(/^urn:uuid:[0-9a-f]{32}$/);
    expect(actor.type).toBe("Service");
    n.actor = actor;

    n.in_reply_to = "urn:irt";

    const context = new NotifyObject();
    expect(context.id).toMatch(/^urn:uuid:[0-9a-f]{32}$/);
    expect(context.type).toBeNull();
    n.context = context;

    expect(n.id).toBe("urn:whatever");
    expect(n.type).toBe("Other");
    expect(n.origin.id).toBe(origin.id);
    expect(n.origin.type).toBe("Service");
    expect(n.origin.inbox).toBe("http://origin.com/inbox");
    expect(n.target.id).toBe(target.id);
    expect(n.target.type).toBe("Service");
    expect(n.target.inbox).toBe("http://target.com/inbox");
    expect(n.object.id).toBe(obj.id);
    expect(n.object.type).toBeNull();
    expect(n.actor.id).toBe(actor.id);
    expect(n.actor.type).toBe("Service");
    expect(n.in_reply_to).toBe("urn:irt");
    expect(n.context.id).toBe(context.id);
    expect(n.context.type).toBeNull();
  });

  it("should construct from fixture", () => {
    const source = NotifyFixtureFactory.source();
    const n = new NotifyPattern({ stream: source });

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
    expect(n.context.item.id).toBe(source.context["ietf:item"].id);
  });

  it("should validate and convert to JSON-LD", () => {
    const n = new NotifyPattern();
    expect(() => n.validate()).toThrow(ValidationError);
    expect(n.to_jsonld()).toBeDefined();

    const source = NotifyFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const n2 = new NotifyPattern({ stream: source });
    expect(n2.validate()).toBe(true);
    expect(n2.to_jsonld()).toEqual(compare);
  });

  it("should fail validation for invalid patterns", () => {
    const invalidSource = NotifyFixtureFactory.invalid();
    const n = new NotifyPattern({ stream: invalidSource });

    expect(() => n.validate()).toThrow(ValidationError);
    expect(() => n.validate()).toThrow(/required/); // Check for required field error
    expect(() => n.validate()).toThrow(/id/); // Check for invalid ID error
  });
});

describe("Pattern Models", () => {
  it("should create Accept from fixture", () => {
    const source = AcceptFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const a = new Accept({ stream: source });
    expect(a.validate()).toBe(true);
    expect(a.to_jsonld()).toEqual(compare);
  });

  it("should create AnnounceEndorsement from fixture", () => {
    const source = AnnounceEndorsementFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ae = new AnnounceEndorsement({ stream: source });
    expect(ae.validate()).toBe(true);
    expect(ae.to_jsonld()).toEqual(compare);
  });

  it("should create AnnounceRelationship from fixture", () => {
    const source = AnnounceRelationshipFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ar = new AnnounceRelationship({ stream: source });
    expect(ar.validate()).toBe(true);
    expect(ar.to_jsonld()).toEqual(compare);
  });

  it("should create AnnounceReview from fixture", () => {
    const source = AnnounceReviewFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ar = new AnnounceReview({ stream: source });
    expect(ar.validate()).toBe(true);
    expect(ar.to_jsonld()).toEqual(compare);
  });

  it("should create AnnounceServiceResult from fixture", () => {
    const source = AnnounceServiceResultFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    compare.type = compare.type[0]; // Single field in JS implementation
    const asr = new AnnounceServiceResult({ stream: source });
    expect(asr.validate()).toBe(true);
    expect(asr.to_jsonld()).toEqual(compare);
  });

  it("should create Reject from fixture", () => {
    const source = RejectFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const r = new Reject({ stream: source });
    expect(r.validate()).toBe(true);
    expect(r.to_jsonld()).toEqual(compare);
  });

  it("should create RequestEndorsement from fixture", () => {
    const source = RequestEndorsementFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const re = new RequestEndorsement({ stream: source });
    expect(re.validate()).toBe(true);
    expect(re.to_jsonld()).toEqual(compare);
  });

  it("should create RequestReview from fixture", () => {
    const source = RequestReviewFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const rr = new RequestReview({ stream: source });
    expect(rr.validate()).toBe(true);
    expect(rr.to_jsonld()).toEqual(compare);
  });

  it("should create TentativelyAccept from fixture", () => {
    const source = TentativelyAcceptFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const ta = new TentativelyAccept({ stream: source });
    expect(ta.validate()).toBe(true);
    expect(ta.to_jsonld()).toEqual(compare);
  });

  it("should create TentativelyReject from fixture", () => {
    const source = TentativelyRejectFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const tr = new TentativelyReject({ stream: source });
    expect(tr.validate()).toBe(true);
    expect(tr.to_jsonld()).toEqual(compare);
  });

  it("should create UnprocessableNotification from fixture", () => {
    const source = UnprocessableNotificationFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const un = new UnprocessableNotification({ stream: source });
    expect(un.validate()).toBe(true);
    expect(un.to_jsonld()).toEqual(compare);
  });

  it("should create UndoOffer from fixture", () => {
    const source = UndoOfferFixtureFactory.source();
    const compare = JSON.parse(JSON.stringify(source));
    const uo = new UndoOffer({ stream: source });
    expect(uo.validate()).toBe(true);
    expect(uo.to_jsonld()).toEqual(compare);
  });
});

describe("Reference vs Value Semantics", () => {
  it("should handle properties by reference", () => {
    const n = new NotifyPattern({ properties_by_reference: true });
    const obj = new NotifyObject();
    expect(obj.id).not.toBe("urn:whatever");

    n.object = obj;
    n.object.id = "urn:whatever";
    expect(n.object.id).toBe("urn:whatever");
    expect(obj.id).toBe("urn:whatever");

    const source = RequestReviewFixtureFactory.source();
    const n2 = new RequestReview({
      stream: source,
      properties_by_reference: true,
    });
    const obj2 = n2.object;
    obj2.id = "urn:whatever";
    expect(n2.object.id).toBe("urn:whatever");
  });

  it("should handle properties by value", () => {
    const n = new NotifyPattern({ properties_by_reference: false });
    const obj = new NotifyObject();
    expect(obj.id).not.toBe("urn:whatever");

    n.object = obj;
    obj.id = "urn:whatever";
    expect(n.object.id).not.toBe("urn:whatever");
    expect(obj.id).toBe("urn:whatever");

    const source = RequestReviewFixtureFactory.source();
    const n2 = new RequestReview({
      stream: source,
      properties_by_reference: false,
    });
    const obj2 = n2.object;
    obj2.id = "urn:whatever";
    expect(n2.object.id).not.toBe("urn:whatever");
  });
});
