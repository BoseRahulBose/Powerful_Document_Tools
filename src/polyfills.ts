// Polyfills for GitHub Pages and modern library compatibility (PDF.js, docx, mammoth)
if (typeof window !== 'undefined') {
  // Polyfill global and process for libraries expecting Node globals
  const w = window as any;
  w.global = w.global || window;
  w.process = w.process || { env: { NODE_ENV: 'production' } };

  // Polyfill Promise.withResolvers if not natively available in the browser (required by modern PDF.js)
  if (typeof (Promise as any).withResolvers === 'undefined') {
    (Promise as any).withResolvers = function <T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

export {};
