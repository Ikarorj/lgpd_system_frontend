import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockInterceptors = { request: { use: vi.fn() }, response: { use: vi.fn() } };

vi.mock("axios", () => ({
  default: {
    create: () => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      interceptors: mockInterceptors,
      defaults: { baseURL: "", withCredentials: true },
    }),
  },
}));

const { default: apiService } = await import("../../../src/services/apiService");

describe("apiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call get with correct path", async () => {
    mockGet.mockResolvedValue({ data: { status: "ok" } });
    const result = await apiService.get("/health");
    expect(mockGet).toHaveBeenCalledWith("/health");
    expect(result.data).toEqual({ status: "ok" });
  });

  it("should call post with correct path and body", async () => {
    mockPost.mockResolvedValue({ data: { id: "1" } });
    const result = await apiService.post("/upload", { file: "test" });
    expect(mockPost).toHaveBeenCalledWith("/upload", { file: "test" });
    expect(result.data).toEqual({ id: "1" });
  });

  it("should call patch with correct path and body", async () => {
    mockPatch.mockResolvedValue({ data: { updated: true } });
    const result = await apiService.patch("/field/1", { value: "new" });
    expect(mockPatch).toHaveBeenCalledWith("/field/1", { value: "new" });
    expect(result.data).toEqual({ updated: true });
  });
});
