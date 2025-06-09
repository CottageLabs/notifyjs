import { describe, it, expect } from "vitest";
import { ActivityStream, Properties } from "../../core/activitystreams2.js";
import { AnnounceEndorsementFixtureFactory } from "../fixtures/announce_endorsement.js";
import { deepCopy } from "../../utils/deepcopy";

describe("ActivityStream", () => {
  it("should construct with empty/default values", () => {
    const as2 = new ActivityStream();
    expect(as2.doc).toEqual({});
    expect(as2.context).toEqual([]);
  });

  it("should construct with source document", () => {
    const source = AnnounceEndorsementFixtureFactory.source();
    const s2 = deepCopy(source);
    const s2context = s2["@context"];
    delete s2["@context"];

    const as2 = new ActivityStream(source);
    expect(as2.doc).toEqual(s2);
    expect(as2.context).toEqual(s2context);
  });

  it("should set properties with namespaces", () => {
    const as2 = new ActivityStream();

    // Basic property
    as2.set_property("random", "value");
    expect(as2.doc["random"]).toBe("value");
    expect(as2.context).toEqual([]);

    // Namespaced property
    as2.set_property(Properties.ID, "id_value");
    expect(as2.doc["id"]).toBe("id_value");
    expect(as2.context).toContain(Properties.ID[1]);

    // Multiple namespaces
    as2.set_property(["object", "http://example.com"], "object_value");
    expect(as2.doc["object"]).toBe("object_value");
    expect(as2.context).toContain("http://example.com");

    // FOAF namespace
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1/"]],
      "name_value"
    );
    expect(as2.doc["foaf:name"]).toBe("name_value");
    expect(as2.context).toContainEqual({ foaf: "http://xmlns.com/foaf/0.1/" });
  });

  it("should get properties with namespaces", () => {
    const as2 = new ActivityStream();
    as2.set_property("random", "value");
    as2.set_property(Properties.ID, "id_value");
    as2.set_property(["object", "http://example.com"], "object_value");
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1/"]],
      "name_value"
    );

    expect(as2.get_property("random")).toBe("value");
    expect(as2.get_property(Properties.ID)).toBe("id_value");
    expect(as2.get_property(["object", "http://example.com"])).toBe(
      "object_value"
    );
    expect(as2.get_property("object")).toBe("object_value");
    expect(
      as2.get_property(["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1/"]])
    ).toBe("name_value");
    expect(as2.get_property("foaf:name")).toBe("name_value");
  });

  it("should convert to JSON-LD format", () => {
    const as2 = new ActivityStream();
    as2.set_property("random", "value");
    as2.set_property(Properties.ID, "id_value");
    as2.set_property(["object", "http://example.com"], "object_value");
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1/"]],
      "name_value"
    );

    const expected = {
      "@context": [
        Properties.ID[1],
        "http://example.com",
        { foaf: "http://xmlns.com/foaf/0.1/" },
      ],
      random: "value",
      id: "id_value",
      object: "object_value",
      "foaf:name": "name_value",
    };

    expect(as2.to_jsonld()).toEqual(expected);
  });
});
