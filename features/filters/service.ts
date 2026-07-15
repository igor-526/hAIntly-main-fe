"use client";

import { ApiError, apiRequest } from "@/lib/api-client";
import type { FilterPreset, FilterPresetListResponse } from "./types";

const root = "/api/filters";

function normalized(error: unknown): never {
  if (error instanceof ApiError) throw error;
  throw new ApiError("Не удалось выполнить операцию с фильтрами.");
}

export const filterService = {
  async list(q?: string, limit = 50, offset = 0): Promise<FilterPresetListResponse> {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      const qs = params.toString();
      return (await apiRequest<FilterPresetListResponse>(`${root}${qs ? `?${qs}` : ""}`)) ?? { items: [], limit, offset };
    } catch (error) {
      return normalized(error);
    }
  },

  async get(id: string): Promise<FilterPreset> {
    try {
      return (await apiRequest<FilterPreset>(`${root}/${encodeURIComponent(id)}`))!;
    } catch (error) {
      return normalized(error);
    }
  },

  async create(data: Record<string, unknown>): Promise<FilterPreset> {
    try {
      return (await apiRequest<FilterPreset>(root, { method: "POST", body: JSON.stringify(data) }))!;
    } catch (error) {
      return normalized(error);
    }
  },

  async update(id: string, data: Record<string, unknown>): Promise<FilterPreset> {
    try {
      return (await apiRequest<FilterPreset>(`${root}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }))!;
    } catch (error) {
      return normalized(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiRequest(`${root}/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      return normalized(error);
    }
  },
};
