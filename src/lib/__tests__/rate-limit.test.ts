import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset the module to clear the internal requestMap between tests
    jest.resetModules();
  });

  it("allows requests within the limit", () => {
    const result = rateLimit("test-allow", 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const id = "test-block";
    for (let i = 0; i < 3; i++) {
      rateLimit(id, 3, 60_000);
    }
    const result = rateLimit(id, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const id = "test-reset";
    jest.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      rateLimit(id, 3, 1_000);
    }

    // Should be blocked now
    expect(rateLimit(id, 3, 1_000).success).toBe(false);

    // Advance past the window
    jest.advanceTimersByTime(1_100);

    // Should be allowed again
    const result = rateLimit(id, 3, 1_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);

    jest.useRealTimers();
  });

  it("returns correct remaining count", () => {
    const id = "test-remaining";
    expect(rateLimit(id, 5, 60_000).remaining).toBe(4);
    expect(rateLimit(id, 5, 60_000).remaining).toBe(3);
    expect(rateLimit(id, 5, 60_000).remaining).toBe(2);
    expect(rateLimit(id, 5, 60_000).remaining).toBe(1);
    expect(rateLimit(id, 5, 60_000).remaining).toBe(0);
    // Now blocked
    expect(rateLimit(id, 5, 60_000).remaining).toBe(0);
  });

  it("handles different identifiers independently", () => {
    const idA = "user-a";
    const idB = "user-b";

    // Exhaust limit for user A
    for (let i = 0; i < 3; i++) {
      rateLimit(idA, 3, 60_000);
    }
    expect(rateLimit(idA, 3, 60_000).success).toBe(false);

    // User B should still be allowed
    const result = rateLimit(idB, 3, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });
});
