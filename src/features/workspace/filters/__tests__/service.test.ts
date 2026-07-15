"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { filterService } from "../service";

vi.mock("@/api/main-be", () => ({
  ApiError: class ApiError extends Error {
    constructor(message: string, public readonly status?: number) {
      super(message);
      this.name = "ApiError";
    }
  },
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/api/main-be";
const mockedApiRequest = vi.mocked(apiRequest);

describe("filterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls GET /api/filters with default params", async () => {
      mockedApiRequest.mockResolvedValue({ items: [{ id: "1", name: "Test" }], limit: 50, offset: 0 });
      const result = await filterService.list();
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters?limit=50&offset=0");
      expect(result.items).toHaveLength(1);
    });

    it("passes search query", async () => {
      mockedApiRequest.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      await filterService.list("search");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters?q=search&limit=50&offset=0");
    });

    it("returns empty on undefined", async () => {
      mockedApiRequest.mockResolvedValue(void 0);
      const result = await filterService.list();
      expect(result.items).toEqual([]);
    });
  });

  describe("get", () => {
    it("calls GET /api/filters/:id", async () => {
      const preset = { id: "1", name: "Test", values: [] };
      mockedApiRequest.mockResolvedValue(preset);
      const result = await filterService.get("1");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters/1");
      expect(result).toEqual(preset);
    });
  });

  describe("create", () => {
    it("calls POST /api/filters with body", async () => {
      const data = { name: "New" };
      mockedApiRequest.mockResolvedValue({ id: "2", name: "New" });
      await filterService.create(data);
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });
  });

  describe("update", () => {
    it("calls PATCH /api/filters/:id with body", async () => {
      mockedApiRequest.mockResolvedValue({ id: "1", name: "Updated" });
      await filterService.update("1", { name: "Updated" });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters/1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      });
    });
  });

  describe("remove", () => {
    it("calls DELETE /api/filters/:id", async () => {
      mockedApiRequest.mockResolvedValue(void 0);
      await filterService.remove("1");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/filters/1", { method: "DELETE" });
    });
  });
});
