import { ActivityStreamsTypes } from "../../core/activitystreams2.js";

export class AcceptFixtureFactory {
  static source() {
    const objectId = "urn:uuid:ddf2fa5d8b8442f38dfe10a5f9700058";
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "urn:uuid:50a1fce5562149c8a533ed69a75e4ee3",
      type: ActivityStreamsTypes.ACCEPT,
      actor: {
        id: "http://localhost:5005/inbox/actor",
        type: "Person",
      },
      origin: {
        id: "http://localhost:5005/inbox/origin",
        type: "Service",
      },
      target: {
        id: "http://localhost:5005/inbox/target",
        type: "Service",
      },
      object: {
        id: objectId,
        type: "Offer",
      },
      inReplyTo: objectId,
    };
  }

  static valid() {
    return JSON.parse(JSON.stringify(this.source()));
  }

  static invalid() {
    const invalid = JSON.parse(JSON.stringify(this.source()));
    delete invalid.inReplyTo;
    return invalid;
  }

  static mismatched() {
    const invalid = JSON.parse(JSON.stringify(this.source()));
    invalid.inReplyTo = "http://localhost:5005/inbox/wrong-id-123";
    return invalid;
  }
}
