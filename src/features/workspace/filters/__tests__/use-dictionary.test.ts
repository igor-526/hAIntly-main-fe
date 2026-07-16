import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dictionaryService } from "../dictionary-service";
import { useDictionary, useDictionaryItems } from "../use-dictionary";

vi.mock("../dictionary-service", () => ({
  dictionaryService: { list: vi.fn(), listItems: vi.fn() },
}));
const service = vi.mocked(dictionaryService);

describe("dictionary hooks", () => {
  beforeEach(() => {
    service.list.mockReset();
    service.listItems.mockReset();
  });
  it("загружает справочник и поддерживает поиск", async () => {
    service.list.mockResolvedValue([{ id: "1", name: "Москва" }]);
    const { result } = renderHook(() => useDictionary("/api/dictionaries/areas"));
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await act(() => result.current.load("санкт"));
    expect(service.list).toHaveBeenLastCalledWith("/api/dictionaries/areas", "санкт");
  });
  it("снимает loading при ошибке dictionary-items", async () => {
    service.listItems.mockRejectedValue(new Error("Сеть"));
    const { result } = renderHook(() => useDictionaryItems("work_format"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
  });
});
