import { describe, it, expect } from "vitest";
import { ActivityStream, Properties } from "../../core/activitystreams2.js";
import { AnnounceEndorsementFixtureFactory } from "../fixtures/announce_endorsement.js";

describe("ActivityStream", () => {
  it("should construct with empty/default values", () => {
    const as2 = new ActivityStream();
    expect(as2.doc).toEqual({});
    expect(as2.context).toEqual([]);
  });

  it("should construct with source document", () => {
    const source = AnnounceEndorsementFixtureFactory.source();
    const as2 = new ActivityStream(source);
    // Compare with full source document since fixture contains complete structure
    const expectedDoc = { ...source };
    delete expectedDoc["@context"];
    expect(as2.doc).toEqual(expectedDoc);
    expect(as2.context).toBeDefined();
  });

  it("should set properties with namespaces", () => {
    const as2 = new ActivityStream();

    // First set an AS property to ensure namespace is registered
    as2.set_property(Properties.ID, "test-id");

    // Then set our test properties
    as2.set_property(["object", "http://localhost:5005"], "object value");
    as2.set_property(["subject", "http://localhost:5005"], "subject value");

    expect(as2.doc["id"]).toBe("test-id");
    expect(as2.doc["object"]).toBe("object value");
    expect(as2.doc["subject"]).toBe("subject value");

    // Verify context contains both namespaces
    expect(as2.context).toContain(Properties.ID[1]);
    expect(as2.context).toContain("http://localhost:5005");
  });

  it("should get properties with namespaces", () => {
    const as2 = new ActivityStream();
    as2.set_property(Properties.ID, "id");
    as2.set_property(["object", "http://localhost:5005"], "object value");
    expect(as2.get_property(Properties.ID)).toBe("id");
    expect(as2.get_property(["object", "http://localhost:5005"])).toBe(
      "object value"
    );
  });

  it("should convert to JSON-LD format", () => {
    const as2 = new ActivityStream();
    as2.set_property(Properties.ID, "id");
    as2.set_property(["object", "http://localhost:5005"], "object value");
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1"]],
      "name value"
    );

    const expected = {
      "@context": [
        Properties.ID[1],
        "http://localhost:5005",
        { foaf: "http://xmlns.com/foaf/0.1" },
      ],
      id: "id",
      object: "object value",
      "foaf:name": "name value",
    };

    expect(as2.to_jsonld()).toEqual(expected);
  });
});
