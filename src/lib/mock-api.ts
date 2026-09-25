/**
 * Stand-in for a real HTTP client while the prototype runs on mock data.
 * Feature `api/` modules call this so swapping in a backend only touches them.
 */
export function mockResponse<T>(data: T, delayMs = 0): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delayMs);
  });
}
