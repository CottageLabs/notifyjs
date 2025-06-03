const { COARNotifyClient } = require('../../client');
const { AnnounceEndorsement } = require('../../patterns/announce_endorsement');
const { AnnounceEndorsementFixtureFactory } = require('../fixtures/announce_endorsement');
const { MockHttpLayer } = require('../mocks/http');

describe('TestClient', () => {
  test('01 construction', () => {
    let client = new COARNotifyClient();
    expect(client.inbox_url).toBeNull();

    client = new COARNotifyClient('http://example.com/inbox');
    expect(client.inbox_url).toBe('http://example.com/inbox');

    client = new COARNotifyClient(null, new MockHttpLayer());
    client = new COARNotifyClient('http://example.com/inbox', new MockHttpLayer());
  });

  test('02 created response', () => {
    const client = new COARNotifyClient('http://example.com/inbox', new MockHttpLayer({
      status_code: 201,
      location: 'http://example.com/location',
    }));
    const source = AnnounceEndorsementFixtureFactory.source();
    const ae = new AnnounceEndorsement(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).toBe('http://example.com/location');
  });

  test('03 accepted response', () => {
    const client = new COARNotifyClient('http://example.com/inbox', new MockHttpLayer({
      status_code: 202,
    }));
    const source = AnnounceEndorsementFixtureFactory.source();
    const ae = new AnnounceEndorsement(source);
    const resp = client.send(ae);
    expect(resp.action).toBe(resp.ACCEPTED);
    expect(resp.location).toBeNull();
  });
});
