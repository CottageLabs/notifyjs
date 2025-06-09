import { describe, it, expect } from "vitest";
import { COARNotifyFactory } from "../../factory.js";
import { NotifyPattern } from "../../core/notify.js";
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

describe("COARNotifyFactory", () => {
  const verifyPatternCreation = (PatternClass, fixtureFactory) => {
    it(`should get ${PatternClass.name} pattern by type`, () => {
      const pattern = COARNotifyFactory.get_by_types(PatternClass.TYPE);
      expect(pattern).toBe(PatternClass);
    });
  };

  verifyPatternCreation(Accept, AcceptFixtureFactory);
  verifyPatternCreation(AnnounceEndorsement, AnnounceEndorsementFixtureFactory);
  verifyPatternCreation(
    AnnounceRelationship,
    AnnounceRelationshipFixtureFactory
  );
  verifyPatternCreation(AnnounceReview, AnnounceReviewFixtureFactory);
  verifyPatternCreation(
    AnnounceServiceResult,
    AnnounceServiceResultFixtureFactory
  );
  verifyPatternCreation(Reject, RejectFixtureFactory);
  verifyPatternCreation(RequestEndorsement, RequestEndorsementFixtureFactory);
  verifyPatternCreation(RequestReview, RequestReviewFixtureFactory);
  verifyPatternCreation(TentativelyAccept, TentativelyAcceptFixtureFactory);
  verifyPatternCreation(TentativelyReject, TentativelyRejectFixtureFactory);
  verifyPatternCreation(
    UnprocessableNotification,
    UnprocessableNotificationFixtureFactory
  );
  verifyPatternCreation(UndoOffer, UndoOfferFixtureFactory);

  it("should generate new ID when none provided", () => {
    const source = { type: "Accept" }; // No ID provided
    const pattern = COARNotifyFactory.get_by_object(source);
    expect(pattern.id).toMatch(
      /^urn:uuid:[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/
    );
  });

  it("should register and use custom pattern", () => {
    class TestPattern extends NotifyPattern {
      static TYPE = "TestPattern";
    }

    COARNotifyFactory.register(TestPattern);
    const pattern = COARNotifyFactory.get_by_types("TestPattern");
    expect(pattern).toBe(TestPattern);
  });
});
