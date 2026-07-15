import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/api/main-be";
import { dictionaryService } from "../dictionary-service";

vi.mock("@/api/main-be", () => ({ apiRequest: vi.fn() }));
const request = vi.mocked(apiRequest);

describe("dictionaryService", () => {
  beforeEach(() => request.mockReset());
  it("сохраняет endpoint и query обычного справочника", async () => {
    request.mockResolvedValue({ items: [{ id: "1", name: "Москва" }] });
    await expect(dictionaryService.list("/api/dictionaries/areas", "моск")).resolves.toEqual([{ id: "1", name: "Москва" }]);
    expect(request).toHaveBeenCalledWith("/api/dictionaries/areas?q=%D0%BC%D0%BE%D1%81%D0%BA&limit=50");
  });
  it("сохраняет endpoint dictionary-items и empty mapping", async () => {
    request.mockResolvedValue(null);
    await expect(dictionaryService.listItems("work_format")).resolves.toEqual([]);
    expect(request).toHaveBeenCalledWith("/api/dictionaries/dictionary-items?dictionary_code=work_format&limit=50");
  });
});
