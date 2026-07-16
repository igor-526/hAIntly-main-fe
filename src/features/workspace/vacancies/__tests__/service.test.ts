import { beforeEach, describe, expect, it, vi } from "vitest";
import { vacancyService } from "../service";

vi.mock("@/api/main-be", () => ({
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public readonly status?: number,
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/api/main-be";
const mockedApiRequest = vi.mocked(apiRequest);

describe("vacancyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("calls GET /api/vacancies without params", async () => {
      mockedApiRequest.mockResolvedValue({
        items: [],
        found: 0,
        page: 0,
        pages: 0,
        per_page: 30,
      });
      const result = await vacancyService.search();
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/vacancies");
      expect(result.items).toEqual([]);
    });

    it("passes search params as query string", async () => {
      mockedApiRequest.mockResolvedValue({
        items: [],
        found: 0,
        page: 0,
        pages: 0,
        per_page: 30,
      });
      await vacancyService.search({ text: "python", page: 0, per_page: 30 });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/vacancies?text=python&page=0&per_page=30");
    });

    it("skips undefined and empty params", async () => {
      mockedApiRequest.mockResolvedValue({
        items: [],
        found: 0,
        page: 0,
        pages: 0,
        per_page: 30,
      });
      await vacancyService.search({
        text: "python",
        preset_id: undefined,
        page: 0,
      });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/vacancies?text=python&page=0");
    });

    it("returns empty response on undefined", async () => {
      mockedApiRequest.mockResolvedValue(void 0);
      const result = await vacancyService.search();
      expect(result).toEqual({
        items: [],
        found: 0,
        page: 0,
        pages: 0,
        per_page: 30,
      });
    });

    it("normalizes non-ApiError", async () => {
      mockedApiRequest.mockRejectedValue(new Error("network"));
      await expect(vacancyService.search()).rejects.toThrow("Не удалось выполнить поиск вакансий");
    });
  });

  describe("get", () => {
    it("calls GET /api/vacancies/:id", async () => {
      const detail = { id: "123", name: "Python Dev" };
      mockedApiRequest.mockResolvedValue(detail);
      const result = await vacancyService.get("123");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/vacancies/123");
      expect(result).toEqual(detail);
    });

    it("encodes vacancy id", async () => {
      mockedApiRequest.mockResolvedValue({ id: "a/b" });
      await vacancyService.get("a/b");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/vacancies/a%2Fb");
    });

    it("throws ApiError as-is", async () => {
      const { ApiError } = await import("@/api/main-be");
      mockedApiRequest.mockRejectedValue(new ApiError("Not found", 404));
      await expect(vacancyService.get("999")).rejects.toMatchObject({
        message: "Not found",
        status: 404,
      });
    });
  });
});
