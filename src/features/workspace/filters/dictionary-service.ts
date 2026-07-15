import { apiRequest } from "@/api/main-be";
import type { DictionaryItem } from "./types";

export const dictionaryService = {
  async list(path: string, query?: string): Promise<DictionaryItem[]> {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("limit", "50");
    const response = await apiRequest<{ items: DictionaryItem[] }>(`${path}?${params.toString()}`);
    return response?.items ?? [];
  },
  async listItems(code: string, query?: string): Promise<DictionaryItem[]> {
    const params = new URLSearchParams({ dictionary_code: code });
    if (query) params.set("q", query);
    params.set("limit", "50");
    const response = await apiRequest<{ items: DictionaryItem[] }>(`/api/dictionaries/dictionary-items?${params.toString()}`);
    return response?.items ?? [];
  },
};
