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

const mockGetUser = jest.fn();
const mockSessionCreate = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
  }),
}));

jest.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockSessionCreate } },
  }),
  PLANS: {
    starter: { name: "Starter", price: 9900, priceId: "price_starter_123" },
    professional: {
      name: "Professional",
      price: 29900,
      priceId: "price_pro_123",
    },
    enterprise: {
      name: "Enterprise",
      price: 49900,
      priceId: "price_ent_123",
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true, remaining: 4 }),
}));

import { POST } from "@/app/api/stripe/checkout/route";

function makeRequest(body: Record<string, unknown>) {
  return new MockNextRequest("http://localhost/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ planKey: "starter" }) as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid plan key", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    const res = await POST(makeRequest({ planKey: "nonexistent" }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid plan or price ID");
  });

  it("resolves planKey to priceId and creates session", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockSessionCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const res = await POST(makeRequest({ planKey: "starter" }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/session_123");

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "a@b.com",
        line_items: [{ price: "price_starter_123", quantity: 1 }],
        mode: "subscription",
        metadata: { user_id: "u1" },
      })
    );
  });

  it("accepts a direct priceId instead of planKey", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockSessionCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_456",
    });

    const res = await POST(makeRequest({ priceId: "price_custom_789" }) as any);
    expect(res.status).toBe(200);
    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_custom_789", quantity: 1 }],
      })
    );
  });
});
