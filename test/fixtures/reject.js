import { BaseFixtureFactory } from "./base_fixture.js";

export class RejectFixtureFactory {
  static source(copy = true) {
    const base = BaseFixtureFactory.create("Reject", {
      inReplyTo: "http://localhost:5005/object",
      object: {
        id: "http://localhost:5005/object",
        type: "Object",
        "ietf:cite-as": "http://localhost:5005/object",
      },
      context: {
        id: "http://localhost:5005/context",
        "ietf:item": {
          id: "http://localhost:5005/context/item",
          mediaType: "application/pdf",
          type: "Document",
        },
      },
    });
    return copy ? JSON.parse(JSON.stringify(base)) : base;
  }

  static invalid() {
    const invalid = BaseFixtureFactory.invalid();
    invalid.type = "Reject";
    invalid.object = { id: "mismatched-id" };
    return invalid;
  }
}
