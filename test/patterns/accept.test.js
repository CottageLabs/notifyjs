import { describe, it, expect } from "vitest";
import { Accept } from "../../patterns/accept.js";
import { ValidationError } from "../../exceptions.js";
import { NotifyService, NotifyObject } from "../../core/notify.js";

const minimalOrigin = new NotifyService({
  stream: {
    id: "http://localhost:5005/inbox/origin",
    type: ["Service"],
    inbox: "http://localhost:5005/inbox",
  },
  validate_stream_on_construct: false,
  validate_properties: false,
});

const minimalTarget = new NotifyService({
  stream: {
    id: "http://localhost:5005/inbox/target",
    type: ["Service"],
    inbox: "http://localhost:5005/inbox",
  },
  validate_stream_on_construct: false,
  validate_properties: false,
});

describe("Accept Pattern", () => {
  it("should create an instance with correct type", () => {
    const accept = new Accept();
    accept.origin = minimalOrigin;
    accept.target = minimalTarget;
    accept.in_reply_to = "http://localhost:5005/inbox/obj123";
    accept.object = new NotifyObject({
      stream: { id: "http://localhost:5005/inbox/obj123", type: "Object" },
    });
    expect(accept.constructor.TYPE).toBe("Accept");
  });

  it("should validate successfully with matching in_reply_to and object id", async () => {
    const accept = new Accept();
    accept.origin = new NotifyService({
      stream: {
        id: "http://localhost:5005/inbox/origin",
        type: ["Service"],
        inbox: "http://localhost:5005/inbox",
      },
      validate_stream_on_construct: false,
      validate_properties: false,
    });
    accept.target = new NotifyService({
      stream: {
        id: "http://localhost:5005/inbox/target",
        type: ["Service"],
        inbox: "http://localhost:5005/inbox",
      },
      validate_stream_on_construct: false,
      validate_properties: false,
    });
    accept.in_reply_to = "http://localhost:5005/inbox/obj123";
    accept.object = new NotifyObject({
      stream: {
        id: "http://localhost:5005/inbox/obj123",
        type: ["Object"],
      },
    });
    await expect(accept.validate()).resolves.not.toThrow();
  });

  it("should throw ValidationError if in_reply_to is missing", async () => {
    const accept = new Accept({
      origin: minimalOrigin,
      target: minimalTarget,
      object: new NotifyObject({
        stream: { id: "http://localhost:5005/inbox/obj123", type: "Object" },
      }),
    });
    await expect(accept.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError if in_reply_to does not match object id", async () => {
    const accept = new Accept({
      origin: minimalOrigin,
      target: minimalTarget,
      in_reply_to: "http://localhost:5005/inbox/obj456",
      object: new NotifyObject({
        stream: { id: "http://localhost:5005/inbox/obj123", type: "Object" },
      }),
    });
    await expect(accept.validate()).rejects.toThrow(ValidationError);
  });
});
