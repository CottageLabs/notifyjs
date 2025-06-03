const { COARNotifyFactory } = require('../../factory');
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

const { NotifyPattern } = require('../../core/notify');

describe('TestFactory', () => {
  test('01 accept', () => {
    let acc = COARNotifyFactory.get_by_types(Accept.TYPE);
    expect(acc).toBe(Accept);

    const source = AcceptFixtureFactory.source();
    acc = COARNotifyFactory.get_by_object(source);
    expect(acc).toBeInstanceOf(Accept);

    expect(acc.id).toBe(source.id);
  });

  test('02 announce endorsement', () => {
    let ae = COARNotifyFactory.get_by_types(AnnounceEndorsement.TYPE);
    expect(ae).toBe(AnnounceEndorsement);

    const source = AnnounceEndorsementFixtureFactory.source();
    ae = COARNotifyFactory.get_by_object(source);
    expect(ae).toBeInstanceOf(AnnounceEndorsement);

    expect(ae.id).toBe(source.id);
  });

  test('04 announce relationship', () => {
    let ar = COARNotifyFactory.get_by_types(AnnounceRelationship.TYPE);
    expect(ar).toBe(AnnounceRelationship);

    const source = AnnounceRelationshipFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(AnnounceRelationship);

    expect(ar.id).toBe(source.id);
  });

  test('05 announce review', () => {
    let ar = COARNotifyFactory.get_by_types(AnnounceReview.TYPE);
    expect(ar).toBe(AnnounceReview);

    const source = AnnounceReviewFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(AnnounceReview);

    expect(ar.id).toBe(source.id);
  });

  test('06 announce service result', () => {
    let ar = COARNotifyFactory.get_by_types(AnnounceServiceResult.TYPE);
    expect(ar).toBe(AnnounceServiceResult);

    const source = AnnounceServiceResultFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(AnnounceServiceResult);

    expect(ar.id).toBe(source.id);
  });

  test('07 reject', () => {
    let ar = COARNotifyFactory.get_by_types(Reject.TYPE);
    expect(ar).toBe(Reject);

    const source = RejectFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(Reject);

    expect(ar.id).toBe(source.id);
  });

  test('08 request endorsement', () => {
    let ar = COARNotifyFactory.get_by_types(RequestEndorsement.TYPE);
    expect(ar).toBe(RequestEndorsement);

    const source = RequestEndorsementFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(RequestEndorsement);

    expect(ar.id).toBe(source.id);
  });

  test('10 request review', () => {
    let ar = COARNotifyFactory.get_by_types(RequestReview.TYPE);
    expect(ar).toBe(RequestReview);

    const source = RequestReviewFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(RequestReview);

    expect(ar.id).toBe(source.id);
  });

  test('11 tentatively accept', () => {
    let ar = COARNotifyFactory.get_by_types(TentativelyAccept.TYPE);
    expect(ar).toBe(TentativelyAccept);

    const source = TentativelyAcceptFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(TentativelyAccept);

    expect(ar.id).toBe(source.id);
  });

  test('12 tentatively reject', () => {
    let ar = COARNotifyFactory.get_by_types(TentativelyReject.TYPE);
    expect(ar).toBe(TentativelyReject);

    const source = TentativelyRejectFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(TentativelyReject);

    expect(ar.id).toBe(source.id);
  });

  test('13 unprocessable notification', () => {
    let ar = COARNotifyFactory.get_by_types(UnprocessableNotification.TYPE);
    expect(ar).toBe(UnprocessableNotification);

    const source = UnprocessableNotificationFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(UnprocessableNotification);

    expect(ar.id).toBe(source.id);
  });

  test('14 undo offer', () => {
    let ar = COARNotifyFactory.get_by_types(UndoOffer.TYPE);
    expect(ar).toBe(UndoOffer);

    const source = UndoOfferFixtureFactory.source();
    ar = COARNotifyFactory.get_by_object(source);
    expect(ar).toBeInstanceOf(UndoOffer);

    expect(ar.id).toBe(source.id);
  });

  test('15 register', () => {
    class TestPattern extends NotifyPattern {}
    TestPattern.TYPE = Accept.TYPE;

    COARNotifyFactory.register(TestPattern);

    const tp = COARNotifyFactory.get_by_types(Accept.TYPE);
    expect(tp).toBe(TestPattern);
  });
});
