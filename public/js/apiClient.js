(function () {
  const isRequestInstance = (input) => {
    return typeof Request !== 'undefined' && input instanceof Request;
  };

  const resolveUrl = (input) => {
    if (typeof input === 'string') {
      try {
        return new URL(input, window.location.origin).toString();
      } catch (error) {
        console.error('apiFetch: unable to resolve URL', input, error);
        throw error;
      }
    }

    if (typeof URL !== 'undefined' && input instanceof URL) {
      return input.toString();
    }

    throw new TypeError('apiFetch expects a string, URL, or Request instance as the first argument.');
  };

  window.apiFetch = function (input, options = {}) {
    if (isRequestInstance(input)) {
      return window.fetch(input, options);
    }

    const url = resolveUrl(input);
    return window.fetch(url, options);
  };
})();
