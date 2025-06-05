/**
 * Single file implementation of a test server, showing all the layers of the general
 * solution in one place.
 */

import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import {
  COARNotifyServer,
  COARNotifyServiceBinding,
  COARNotifyReceipt,
  COARNotifyServerError,
} from "../../server.js";

function NestedPatternObjectMixin(Base) {
  return class extends Base {
    constructor(...args) {
      super(...args);
    }
  };
}
import { NotifyPattern } from "../../core/notify.js";

const app = express();
app.use(bodyParser.json());

const config = {
  STORE_DIR: process.env.STORE_DIR || "./store",
  RESPONSE_STATUS: COARNotifyReceipt.CREATED,
  VALIDATE_INCOMING: true,
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || 5005,
  DEBUG: process.env.DEBUG === "true" || false,
};

class COARNotifyServiceTestImpl extends COARNotifyServiceBinding {
  /**
   * Process an incoming notification object in the following way:
   * 1. Generate a name for the notification based on the timestamp and a random UUID
   * 2. Write the notification JSON-LD to a file in the store directory
   * 3. Return a receipt for the notification using the configured response status and a location pointing to the file
   * @param {NotifyPattern} notification
   * @returns {COARNotifyReceipt}
   */
  notification_received(notification) {
    const store = config.STORE_DIR;
    if (!fs.existsSync(store)) {
      console.error(
        `Store directory ${store} does not exist, you must create it manually`
      );
      throw new COARNotifyServerError(500, "Store directory does not exist");
    }

    const now = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 15);
    const fn = `${now}_${uuidv4().replace(/-/g, "")}`;

    fs.writeFileSync(
      path.join(store, `${fn}.json`),
      JSON.stringify(notification.to_jsonld())
    );

    const rstatus = config.RESPONSE_STATUS;
    const location = `${
      app.get("urlRoot") || `http://${config.HOST}:${config.PORT}/`
    }inbox/${fn}`;

    return new COARNotifyReceipt(rstatus, location);
  }
}

app.post("/inbox", (req, res) => {
  const notification = req.body;
  const server = new COARNotifyServer(new COARNotifyServiceTestImpl());

  try {
    const result = server.receive(notification, {
      validate: config.VALIDATE_INCOMING,
    });
    res.status(result.status);
    if (result.status === COARNotifyReceipt.CREATED) {
      res.set("Location", result.location);
    }
    res.send();
  } catch (e) {
    if (e instanceof COARNotifyServerError) {
      res.status(e.status).send(e.message);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

function run_server(host = config.HOST, port = config.PORT) {
  if (!fs.existsSync(config.STORE_DIR)) {
    console.error(
      `Store directory: ${config.STORE_DIR} does not exist, you must create it manually`
    );
    process.exit(1);
  } else {
    console.log(`Store directory: ${config.STORE_DIR}`);
  }

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  run_server();
}

export { app, run_server, COARNotifyServiceTestImpl };
