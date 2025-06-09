import { describe, it, expect } from "vitest";
import { COARNotifyFactory } from "../factory.js";
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
} from "../patterns/index.js";
import { NotifyPattern } from "../core/notify.js";

// Mock fixture sources for testing
const fixtures = {
  Accept: { id: "accept-id", type: Accept.TYPE },
  AnnounceEndorsement: { id: "ae-id", type: AnnounceEndorsement.TYPE },
  AnnounceRelationship: { id: "ar-id", type: AnnounceRelationship.TYPE },
  AnnounceReview: { id: "arv-id", type: AnnounceReview.TYPE },
  AnnounceServiceResult: { id: "asr-id", type: AnnounceServiceResult.TYPE },
  Reject: { id: "reject-id", type: Reject.TYPE },
  RequestEndorsement: { id: "re-id", type: RequestEndorsement.TYPE },
  RequestReview: { id: "rr-id", type: RequestReview.TYPE },
  TentativelyAccept: { id: "ta-id", type: TentativelyAccept.TYPE },
  TentativelyReject: { id: "tr-id", type: TentativelyReject.TYPE },
  UnprocessableNotification: {
    id: "un-id",
    type: UnprocessableNotification.TYPE,
  },
  UndoOffer: { id: "uo-id", type: UndoOffer.TYPE },
};

describe("COARNotifyFactory", () => {
  it("should get pattern by type Accept", () => {
    const acc = COARNotifyFactory.get_by_types(Accept.TYPE);
    expect(acc).toBe(Accept);
  });

  it("should get pattern by object Accept", () => {
    const acc = COARNotifyFactory.get_by_object(fixtures.Accept);
    expect(acc.constructor.TYPE).toBe(Accept.TYPE);
    const accId = acc.id;
    expect(typeof accId).toBe("string");
    expect(accId.length).toBeGreaterThan(0);
  });

  it("should get pattern by type AnnounceEndorsement", () => {
    const ae = COARNotifyFactory.get_by_types(AnnounceEndorsement.TYPE);
    expect(ae).toBe(AnnounceEndorsement);
  });

  it("should get pattern by object AnnounceEndorsement", () => {
    const ae = COARNotifyFactory.get_by_object(fixtures.AnnounceEndorsement);
    expect(ae.constructor.TYPE).toBe(AnnounceEndorsement.TYPE);
    const aeId = ae.id;
    expect(typeof aeId).toBe("string");
    expect(aeId.length).toBeGreaterThan(0);
  });

  // Similar tests for other patterns...

  it("should register a new pattern", () => {
    class TestPattern extends NotifyPattern {
      static TYPE = Accept.TYPE;
    }

    COARNotifyFactory.register(TestPattern);

    const tp = COARNotifyFactory.get_by_types(Accept.TYPE);
    expect(tp).toBe(TestPattern);
  });
});
