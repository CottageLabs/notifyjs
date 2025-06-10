import { COARNotifyClient } from "../../client";
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
} from "../../patterns";
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
} from "../fixtures";

const INBOX = "http://localhost:5005/inbox";

describe("TestClient Integration", () => {
  test("01 accept", () => {
    const client = new COARNotifyClient(INBOX);
    const source = AcceptFixtureFactory.source();
    const acc = new Accept(source);
    const resp = client.send(acc);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("02 announce endorsement", () => {
    const client = new COARNotifyClient(INBOX);
    const source = AnnounceEndorsementFixtureFactory.source();
    const ae = new AnnounceEndorsement(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("04 announce relationship", () => {
    const client = new COARNotifyClient(INBOX);
    const source = AnnounceRelationshipFixtureFactory.source();
    const ae = new AnnounceRelationship(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("05 announce review", () => {
    const client = new COARNotifyClient(INBOX);
    const source = AnnounceReviewFixtureFactory.source();
    const ae = new AnnounceReview(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("06 announce service result", () => {
    const client = new COARNotifyClient(INBOX);
    const source = AnnounceServiceResultFixtureFactory.source();
    const ae = new AnnounceServiceResult(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("07 reject", () => {
    const client = new COARNotifyClient(INBOX);
    const source = RejectFixtureFactory.source();
    const ae = new Reject(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("08 request endorsement", () => {
    const client = new COARNotifyClient(INBOX);
    const source = RequestEndorsementFixtureFactory.source();
    const ae = new RequestEndorsement(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("09 request review", () => {
    const client = new COARNotifyClient(INBOX);
    const source = RequestReviewFixtureFactory.source();
    const ae = new RequestReview(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("10 tentatively accept", () => {
    const client = new COARNotifyClient(INBOX);
    const source = TentativelyAcceptFixtureFactory.source();
    const ae = new TentativelyAccept(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("11 tentatively reject", () => {
    const client = new COARNotifyClient(INBOX);
    const source = TentativelyRejectFixtureFactory.source();
    const ae = new TentativelyReject(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("12 unprocessable notification", () => {
    const client = new COARNotifyClient(INBOX);
    const source = UnprocessableNotificationFixtureFactory.source();
    const ae = new UnprocessableNotification(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });

  test("13 undo offer", () => {
    const client = new COARNotifyClient(INBOX);
    const source = UndoOfferFixtureFactory.source();
    const ae = new UndoOffer(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).not.toBeNull();
    console.log(resp.location);
  });
});
