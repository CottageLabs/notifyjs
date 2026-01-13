# COAR Notify JS Library

This is the JavaScript implementation of the COAR Notify library, a port of the original Python library.

## Installation

Install via npm:

```bash
npm i @cottagelabs/coarnotifyjs
```

## Usage

Import the main components from the package:

```js
import {
  COARNotifyClient,
  COARNotifyFactory,
  HttpLayer,
  RequestsHttpLayer,
  COARNotifyReceipt,
  COARNotifyServiceBinding,
  COARNotifyServerError,
  COARNotifyServer,
  NotifyPattern,
  SummaryMixin,
  NotifyTypes,
  ActivityStreamsTypes,
  Properties,
  ValidationError,
  NotifyException,a
  Accept,
  AnnounceEndorsement,
  AnnounceRelationship,
  AnnounceReview,
  AnnounceServiceResult,
  Reject,
  RequestEndorsement,
  RequestReview,
  TentativelyAccept,
  TentativelyReject,
  UndoOffer,
  UnprocessableNotification,
} from "@cottagelabs/coarnotifyjs";
```

## Testing

Run tests using:

```bash
npm test
```

## Architecture

This library implements the COAR Notify specification based on the [COAR Notify Architecture](https://coar-notify.net/guide/architecture/#w3c-ldn).

The core functionality is implemented in the `core/` directory, with notification patterns in the `patterns/` directory.

## Contributing

Contributions are welcome. Please open issues or pull requests on the GitHub repository.

## License

MIT License
