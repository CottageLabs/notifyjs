export const UNPROCESSABLE_NOTIFICATION = {
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
  type: ["coar-notify:UnprocessableNotification"],
};

export class UnprocessableNotificationFixtureFactory {
  static source(copy = true) {
    return copy
      ? JSON.parse(JSON.stringify(UNPROCESSABLE_NOTIFICATION))
      : UNPROCESSABLE_NOTIFICATION;
  }

  static invalid() {
    const source = this.source();
    // TODO: Implement invalid modifications
    return source;
  }
}
