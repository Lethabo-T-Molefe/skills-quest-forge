/**
 * The demo members' password comes from the environment, never from the repository:
 *
 *   DEMO_PASSWORD=... npx playwright test
 *
 * It is the DEMO_PASSWORD the API was started with.
 */
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "";

if (!DEMO_PASSWORD) {
  throw new Error("Set DEMO_PASSWORD to the API's demo password to run the end-to-end tests.");
}
