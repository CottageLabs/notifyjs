import { describe, it, expect, vi } from "vitest";
import { COARNotifyClient, NotifyResponse } from "../../client.js";
import { MockHttpLayer } from "../mocks/http.js";
import { AnnounceEndorsement } from "../../patterns/announce_endorsement.js";
import { 
  ActivityStreamsTypes, 
  Properties,
  ACTIVITY_STREAMS_NAMESPACE
} from "../../core/activitystreams2.js";
import { NotifyProperties } from "../../core/notify.js";

describe("COARNotifyClient", () => {
  beforeAll(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should construct with different parameters", () => {
    let client = new COARNotifyClient();
    expect(client.inbox_url).toBeNull();

    client = new COARNotifyClient("http://localhost:5005/inbox");
    expect(client.inbox_url).toBe("http://localhost:5005/inbox");

    client = new COARNotifyClient(null, new MockHttpLayer());
    expect(client.inbox_url).toBeNull();

    client = new COARNotifyClient(
      "http://localhost:5005/inbox",
      new MockHttpLayer()
    );
    expect(client.inbox_url).toBe("http://localhost:5005/inbox");
  });

  it("should handle created response (201 status)", async () => {
    const client = new COARNotifyClient(
      "http://localhost:5005/inbox",
      new MockHttpLayer({
        status_code: 201,
        location: "http://localhost:5005/location",
      })
    );

    const source = {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://coar-notify.net",
      ],
      [Properties.ID[0]]: "urn:uuid:1234567890abcdef1234567890abcdef",
      [Properties.IN_REPLY_TO[0]]: "urn:uuid:0370c0fb-bb78-4a9b-87f5-bed307a509dd",
      [Properties.TYPE[0]]: [
        [ActivityStreamsTypes.ANNOUNCE, ACTIVITY_STREAMS_NAMESPACE],
        ["coar-notify:EndorsementAction", "https://coar-notify.net"]
      ],
      [Properties.ACTOR[0]]: {
        [Properties.ID[0]]: "http://localhost:5005/service",
        "name": "Service Name",
        [Properties.TYPE[0]]: [ActivityStreamsTypes.SERVICE, ACTIVITY_STREAMS_NAMESPACE]
      },
      [Properties.CONTEXT[0]]: {
        [Properties.ID[0]]: "http://localhost:5005/context",
        [Properties.TYPE[0]]: [ActivityStreamsTypes.OBJECT, ACTIVITY_STREAMS_NAMESPACE]
      },
      [Properties.OBJECT[0]]: {
        [Properties.ID[0]]: "http://localhost:5005/object",
        [NotifyProperties.CITE_AS]: "http://localhost:5005/object",
        [Properties.TYPE[0]]: [
          [ActivityStreamsTypes.PAGE, ACTIVITY_STREAMS_NAMESPACE],
          ["sorg:WebPage", "https://schema.org"]
        ]
      },
      [Properties.ORIGIN[0]]: {
        [Properties.ID[0]]: "http://localhost:5005/origin",
        [NotifyProperties.INBOX]: "http://localhost:5005/origin/inbox",
        [Properties.TYPE[0]]: [ActivityStreamsTypes.SERVICE, ACTIVITY_STREAMS_NAMESPACE]
      },
      [Properties.TARGET[0]]: {
        [Properties.ID[0]]: "http://localhost:5005/target",
        [NotifyProperties.INBOX]: "http://localhost:5005/target/inbox",
        [Properties.TYPE[0]]: [ActivityStreamsTypes.SERVICE, ACTIVITY_STREAMS_NAMESPACE]
      }
    };

    let notification;
    try {
      notification = new AnnounceEndorsement({ stream: source });
      console.log("Notification created:", notification);
    } catch (err) {
      console.error("Validation error creating notification:", err);
      throw err;
    }
    const resp = await client.send(notification);

    expect(resp.action).toBe(NotifyResponse.CREATED);
    expect(resp.location).toBe("http://localhost:5005/location");
  });
});
