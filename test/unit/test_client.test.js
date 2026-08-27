import { describe, it, expect } from "vitest";
import { COARNotifyClient } from "../../client.js";
import { AnnounceEndorsement } from "../../patterns/announce_endorsement.js";
import { AnnounceEndorsementFixtureFactory } from "../fixtures/announce_endorsement.js";
import { MockHttpLayer } from "../mocks/http.js";

function announceEndorsement() {
  return new AnnounceEndorsement({
    stream: AnnounceEndorsementFixtureFactory.source(),
    validate_stream_on_construct: false,
  });
}

describe("COARNotifyClient", () => {
  it("construction", () => {
    let client = new COARNotifyClient();
    expect(client.inbox_url).toBeNull();

    client = new COARNotifyClient("http://example.com/inbox");
    expect(client.inbox_url).toBe("http://example.com/inbox");

    client = new COARNotifyClient(null, new MockHttpLayer());
    expect(client.inbox_url).toBeNull();

    client = new COARNotifyClient("http://example.com/inbox", new MockHttpLayer());
    expect(client.inbox_url).toBe("http://example.com/inbox");
  });

  it("maps a 201 response to a CREATED result with a location", () => {
    const client = new COARNotifyClient(
      "http://example.com/inbox",
      new MockHttpLayer({ status_code: 201, location: "http://example.com/location" })
    );
    const resp = client.send(announceEndorsement(), null, false);
    expect(resp.action).toBe("created");
    expect(resp.location).toBe("http://example.com/location");
  });

  it("maps a 202 response to an ACCEPTED result with no location", () => {
    const client = new COARNotifyClient(
      "http://example.com/inbox",
      new MockHttpLayer({ status_code: 202 })
    );
    const resp = client.send(announceEndorsement(), null, false);
    expect(resp.action).toBe("accepted");
    expect(resp.location).toBeNull();
  });
});
