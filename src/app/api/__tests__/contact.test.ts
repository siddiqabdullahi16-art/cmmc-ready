// Mock next/server before any imports that use it
class MockNextRequest {
  private _body: Record<string, unknown>;
  private _headers: Map<string, string>;

  constructor(_url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
    this._body = init?.body ? JSON.parse(init.body) : {};
    this._headers = new Map(Object.entries(init?.headers ?? {}));
  }

  async json() {
    return this._body;
  }

  get headers() {
    return {
      get: (key: string) => this._headers.get(key) ?? null,
    };
  }
}

class MockNextResponse {
  static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
    return {
      status: init?.status ?? 200,
      json: async () => body,
      headers: new Map(Object.entries(init?.headers ?? {})),
    };
  }
}

jest.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}));

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 4 }),
}));

import { POST } from "@/app/api/contact/route";

function makeRequest(body: Record<string, unknown>) {
  return new MockNextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("returns 400 for missing fields", async () => {
    const res = await POST(makeRequest({ name: "Alice" }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("All fields are required");
  });

  it("returns 400 for invalid types", async () => {
    const res = await POST(
      makeRequest({ name: 123, email: "a@b.com", message: "hi" }) as any
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid input");
  });

  it("returns 400 for message too long", async () => {
    const longMessage = "x".repeat(5001);
    const res = await POST(
      makeRequest({ name: "Alice", email: "a@b.com", message: longMessage }) as any
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Message too long");
  });

  it("saves valid submission and returns ok", async () => {
    const res = await POST(
      makeRequest({ name: "Alice", email: "A@B.com", message: "Hello" }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("contact_submissions");
    expect(mockInsert).toHaveBeenCalledWith({
      name: "Alice",
      email: "a@b.com",
      message: "Hello",
    });
  });

  it("returns 500 when Supabase insert fails", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db error" } });
    const res = await POST(
      makeRequest({ name: "Alice", email: "a@b.com", message: "Hello" }) as any
    );
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to save");
  });
});
