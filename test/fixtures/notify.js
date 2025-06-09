export const NOTIFY = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://coar-notify.net",
  ],
  actor: {
    id: "https://overlay-journal.com",
    name: "Overlay Journal",
    type: "Service",
  },
  context: {
    id: "https://research-organisation.org/repository/preprint/201203/421/",
    "ietf:item": {
      id: "https://research-organisation.org/repository/preprint/201203/421/content",
      mediaType: "application/pdf",
      type: "Document",
    },
  },
  id: "urn:uuid:94ecae35-dcfd-4182-8550-22c7164fe23f",
  inReplyTo: "urn:uuid:0370c0fb-bb78-4a9b-87f5-bed307a509dd",
  object: {
    id: "https://overlay-journal.com/articles/00001/",
    "ietf:cite-as": "https://overlay-journal.com/articles/00001/",
    type: ["Page", "sorg:WebPage"],
  },
  origin: {
    id: "https://overlay-journal.com/system",
    inbox: "https://overlay-journal.com/inbox/",
    type: "Service",
  },
  target: {
    id: "https://research-organisation.org/repository",
    inbox: "https://research-organisation.org/inbox/",
    type: "Service",
  },
  type: "Object",
};

export class NotifyFixtureFactory {
  static source(copy = true) {
    return copy ? JSON.parse(JSON.stringify(NOTIFY)) : NOTIFY;
  }

  static invalid() {
    const source = this.source();
    // Create invalid cases
    delete source["@context"]; // Missing required context
    source.id = "invalid-id"; // Invalid ID format
    source.type = ["InvalidType"]; // Invalid type
    source.origin = {}; // Missing required origin fields
    return source;
  }

  static expected_value(prop_path) {
    const source = this.source(false);
    const parts = prop_path.split(".");
    let value = source;
    for (const part of parts) {
      if (value === undefined) return undefined;
      value = value[part];
    }
    return value;
  }
}
