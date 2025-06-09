import { describe, it, expect } from "vitest";
import { ActivityStream, Properties } from "../../core/activitystreams2.js";

describe("ActivityStream", () => {
  it("should construct empty ActivityStream", () => {
    const as2 = new ActivityStream();
    expect(as2.doc).toEqual({});
    expect(as2.context).toEqual([]);
  });

  it("should set and get properties correctly", () => {
    const as2 = new ActivityStream();

    as2.set_property("random", "value");
    expect(as2.doc["random"]).toBe("value");
    expect(as2.context).toEqual([]);

    as2.set_property(Properties.ID, "value");
    expect(as2.doc["id"]).toBe("value");
    expect(as2.context).toEqual([Properties.ID[1]]);

    as2.set_property(Properties.TYPE, "another");
    expect(as2.doc["type"]).toBe("another");
    expect(as2.context).toEqual([Properties.ID[1]]);

    as2.set_property(["object", "http://example.com"], "object value");
    as2.set_property(["subject", "http://example.com"], "subject value");
    expect(as2.doc["object"]).toBe("object value");
    expect(as2.doc["subject"]).toBe("subject value");
    expect(as2.context).toEqual([Properties.ID[1], "http://example.com"]);

    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1"]],
      "name value"
    );
    as2.set_property(
      ["foaf:email", ["foaf", "http://xmlns.com/foaf/0.1"]],
      "email value"
    );
    expect(as2.doc["foaf:name"]).toBe("name value");
    expect(as2.doc["foaf:email"]).toBe("email value");
    expect(as2.context).toEqual([
      Properties.ID[1],
      "http://example.com",
      { foaf: "http://xmlns.com/foaf/0.1" },
    ]);
  });

  it("should get properties correctly", () => {
    const as2 = new ActivityStream();
    as2.set_property("random", "value");
    as2.set_property(Properties.ID, "id");
    as2.set_property(["object", "http://example.com"], "object value");
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1"]],
      "name value"
    );

    expect(as2.get_property("random")).toBe("value");
    expect(as2.get_property(Properties.ID)).toBe("id");
    expect(as2.get_property(["object", "http://example.com"])).toBe(
      "object value"
    );
    expect(as2.get_property("object")).toBe("object value");
    expect(as2.get_property(["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1"]])).toBe(
      "name value"
    );
    expect(as2.get_property("foaf:name")).toBe("name value");
  });

  it("should convert to JSON-LD correctly", () => {
    const as2 = new ActivityStream();
    as2.set_property("random", "value");
    as2.set_property(Properties.ID, "id");
    as2.set_property(["object", "http://example.com"], "object value");
    as2.set_property(
      ["foaf:name", ["foaf", "http://xmlns.com/foaf/0.1"]],
      "name value"
    );

    const expected = {
      "@context": [Properties.ID[1], "http://example.com", { foaf: "http://xmlns.com/foaf/0.1" }],
      random: "value",
      id: "id",
      object: "object value",
      "foaf:name": "name value",
    };

    expect(as2.to_jsonld()).toEqual(expected);
  });
});
