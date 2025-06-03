# Testing the coarnotifyjs Library

This document provides instructions on how to test the coarnotifyjs library, including running the existing tests and verifying the library usage via `npm link`.

## 1. Running the Existing Tests

The library includes unit, integration, fixture, mock, and server tests located in the `test/` directory.

### Prerequisites

- Node.js and npm installed on your system.
- Recommended to use a Node.js version compatible with ES6 modules and async/await.

### Install Dependencies

```bash
npm install
```

### Run Tests

The tests are written using Jest. To run all tests, execute:

```bash
npm test
```

Or to run Jest directly:

```bash
npx jest
```

This will run all tests under the `test/` directory and output the results.

## 2. Using `npm link` to Test the Library in Another Project

To verify that the library works properly when used as an npm package, you can use `npm link` to create a local symlink.

### Steps

1. In the `coarnotifyjs` directory, run:

```bash
npm link
```

This will create a global symlink for the library.

2. In your other project directory where you want to use the library, run:

```bash
npm link coarnotifyjs
```

This will link the local `coarnotifyjs` library into your project's `node_modules`.

3. In your project, you can now import and use the library as if it was installed from npm:

```javascript
const { COARNotifyClient } = require('coarnotifyjs');
// Use the library as needed
```

4. Run your project's code and tests to verify the integration.

### To unlink

To remove the link, run in your project directory:

```bash
npm unlink coarnotifyjs
```

And to remove the global link, run in `coarnotifyjs` directory:

```bash
npm unlink
```

## Notes

- Ensure that your project and the `coarnotifyjs` library use compatible Node.js versions.
- If you make changes to the `coarnotifyjs` library, you may need to restart your project or re-link to see the changes.
- The tests cover core functionality, patterns, client, server, and HTTP layers.

---

If you need any assistance running the tests or using the library, feel free to ask.
