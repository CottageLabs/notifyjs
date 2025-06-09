export class MockHttpLayer {
  constructor(responseConfig = {}) {
    this._responseConfig = responseConfig;
  }

  post(url, options) {
    // Simulate an HTTP response object
    return {
      status_code: this._responseConfig.status_code || 200,
      header: (name) => {
        if (name.toLowerCase() === 'location') {
          return this._responseConfig.location || null;
        }
        return null;
      },
    };
  }
}
