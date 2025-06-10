import { describe, it, expect } from "vitest";
import {
  NotifyPattern,
  NotifyService,
  NotifyObject,
} from "../../core/notify.js";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../../exceptions.js";
import { Properties } from "../../core/activitystreams2.js";

describe("TestValidate", () => {
  it("01 structural empty", () => {
    const n = new NotifyPattern();
    n.id = null;
    n.type = null;
    expect(() => n.validate()).toThrow(ValidationError);
  });

  it("02 structural basic", () => {
    const n = new NotifyPattern();
    expect(() => n.validate()).toThrow(ValidationError);
  });

  it("03 structural valid document", () => {
    const n = new NotifyPattern({
      validate_stream_on_construct: false,
      validate_properties: true,
    });

    const testId = `urn:uuid:${uuidv4().replace(/-/g, "")}`;

    const validDoc = {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        {
          inbox: {
            "@id": "https://www.w3.org/ns/activitystreams#inbox",
            "@type": "@id",
          },
          "coar-notify": "https://notify.coar-repositories.org/ns/",
        },
      ],
      id: testId,
      type: "Announce",
      origin: {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: "https://origin.coar-notify.org/service",
        type: "Service",
        inbox: "https://origin.coar-notify.org/inbox",
      },
      target: {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: "https://target.coar-notify.org/service",
        type: "Service",
        inbox: "https://target.coar-notify.org/inbox",
      },
      object: {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: "https://object.coar-notify.org/resource",
        type: "Document",
      },
    };

    // Create properly initialized objects with all required fields
    // Create properly initialized objects with all required fields
    const origin = new NotifyService({
      stream: {
        ...validDoc.origin,
        type: "Service", // Explicitly set type
      },
      validate_stream_on_construct: false,
      validation_context: Properties.ORIGIN,
    });

    const target = new NotifyService({
      stream: {
        ...validDoc.target,
        type: "Service", // Explicitly set type
      },
      validate_stream_on_construct: false,
      validation_context: Properties.TARGET,
    });

    const obj = new NotifyObject({
      stream: {
        ...validDoc.object,
        type: "Document", // Explicitly set type
      },
      validate_stream_on_construct: false,
      validation_context: Properties.OBJECT,
    });

    n.id = validDoc.id;
    n.type = validDoc.type;
    n.origin = origin;
    n.target = target;
    n.object = obj;

    expect(() => n.validate()).not.toThrow();
  });

  it("04 structural invalid nested", () => {
    const n = new NotifyPattern();
    n.target = new NotifyService(
      { whatever: "value" },
      { validate_stream_on_construct: false }
    );
    n.origin = new NotifyService(
      { another: "junk" },
      { validate_stream_on_construct: false }
    );
    n.object = new NotifyObject(
      { yet: "more" },
      { validate_stream_on_construct: false }
    );
    expect(() => n.validate()).toThrow(ValidationError);
  });
});
