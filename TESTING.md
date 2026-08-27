# Testing the coarnotifyjs Library

This document explains how to run the test suite and how to try the library out
in another project via `npm link`.

## 1. Running the Test Suite

The tests live in the `test/` directory and are run with
[Vitest](https://vitest.dev/).

### Prerequisites

- Node.js (a version with native ES module support) and npm.

### Install Dependencies

```bash
npm install
```

### Run the Tests

```bash
npm test
```

This runs `vitest` over every `test/**/*.test.js` file:

- `test/core/` – ActivityStreams 2.0 core objects
- `test/patterns/` – the individual notification patterns
- `test/unit/` – client, factory and ActivityStreams unit tests
- `test/fixtures/` and `test/mocks/` – shared test data and a mock HTTP layer

To run a single file or watch for changes:

```bash
npx vitest run test/unit/test_client.test.js   # one file, once
npx vitest                                      # watch mode
```

> **Note:** The package is ESM (`"type": "module"` in `package.json`). Test
> files must use `import`, not `require`.

## 2. Using `npm link` to Test the Library in Another Project

1. In this repository:

   ```bash
   npm link
   ```

2. In the other project:

   ```bash
   npm link @cottagelabs/coarnotifyjs
   ```

3. Import and use it as if it were installed from npm:

   ```javascript
   import { COARNotifyClient } from "@cottagelabs/coarnotifyjs";
   ```

4. To undo the link:

   ```bash
   npm unlink @cottagelabs/coarnotifyjs   # in the other project
   npm unlink                             # in this repository
   ```

---

If you need any help running the tests or using the library, please open an
issue on GitHub.
