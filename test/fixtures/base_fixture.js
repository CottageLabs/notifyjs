export class BaseFixtureFactory {
  static create(type, customProps = {}) {
    return {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://coar-notify.net",
      ],
      id: "urn:uuid:94ecae35-dcfd-4182-8550-22c7164fe23f",
      type: type,
      actor: {
        id: "http://localhost:5005/service",
        type: "Service",
        ...(customProps.actor || {}),
      },
      origin: {
        id: "http://localhost:5005/origin",
        inbox: "http://localhost:5005/origin/inbox",
        type: "Service",
        ...(customProps.origin || {}),
      },
      target: {
        id: "http://localhost:5005/target",
        inbox: "http://localhost:5005/target/inbox",
        type: "Service",
        ...(customProps.target || {}),
      },
      object: {
        id: "http://localhost:5005/object",
        type: "Object",
        ...(customProps.object || {}),
      },
      ...customProps,
    };
  }

  static invalid() {
    return {
      "@context": [],
      id: "invalid-id",
      type: "InvalidType",
      origin: {},
      target: {},
      object: {},
    };
  }
}
