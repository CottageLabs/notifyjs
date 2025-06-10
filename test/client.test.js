import { describe, it, expect } from "vitest";
import { COARNotifyClient } from "../client.js";
import { AnnounceEndorsement } from "../patterns/announce_endorsement.js";
import { ANNOUNCE_ENDORSEMENT } from "../test/fixtures/announce_endorsement.js";

class MockHttpLayer {
  constructor({ status_code = 200, location = null } = {}) {
    this.status_code = status_code;
    this.location = location;
  }

  send() {
    return Promise.resolve({
      statusCode: this.status_code,
      headers: { location: this.location },
    });
  }
}

describe("COARNotifyClient", () => {
  it("should construct with no inbox_url", () => {
    const client = new COARNotifyClient();
    expect(client.inbox_url).toBeNull();
  });

  it("should construct with inbox_url", () => {
    const client = new COARNotifyClient("http://localhost:5005/inbox");
    expect(client.inbox_url).toBe("http://localhost:5005/inbox");
  });

  it("should construct with http_layer", () => {
    const client = new COARNotifyClient(null, new MockHttpLayer());
    expect(client).toBeDefined();
  });

  it("should handle created response", async () => {
    const client = new COARNotifyClient(
      "http://localhost:5005/inbox",
      new MockHttpLayer({
        status_code: 201,
        location: "http://localhost:5005/location",
      })
    );
    const ae = new AnnounceEndorsement(ANNOUNCE_ENDORSEMENT);
    const resp = await client.send(ae);
    expect(resp.action).toBe(resp.CREATED);
    expect(resp.location).toBe("http://localhost:5005/location");
  });

  it("should handle accepted response", async () => {
    const client = new COARNotifyClient(
      "http://localhost:5005/inbox",
      new MockHttpLayer({ status_code: 202 })
    );
    const ae = new AnnounceEndorsement(ANNOUNCE_ENDORSEMENT);
    const resp = await client.send(ae);
    expect(resp.action).toBe(resp.ACCEPTED);
    expect(resp.location).toBeNull();
  });
});
