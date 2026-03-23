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
  rateLimit: () => ({ success: true, remaining: 9 }),
}));

import { POST } from "@/app/api/leads/route";

function makeRequest(body: Record<string, unknown>) {
  return new MockNextRequest("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({ source: "quiz" }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Email is required");
  });

  it("returns 400 for non-string email", async () => {
    const res = await POST(makeRequest({ email: 123 }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Email is required");
  });

  it("saves a valid lead and returns ok", async () => {
    const res = await POST(
      makeRequest({ email: "Test@Example.com", source: "landing", score: 85 }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockInsert).toHaveBeenCalledWith({
      email: "test@example.com",
      source: "landing",
      score: 85,
      answers: null,
    });
  });

  it("defaults source to 'quiz' when not provided", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }) as any);
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ source: "quiz" })
    );
  });

  it("returns 500 when Supabase insert fails", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db error" } });
    const res = await POST(makeRequest({ email: "a@b.com" }) as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to save");
  });
});
