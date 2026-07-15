import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useVacancySearch } from "../use-vacancy-search";

vi.mock("../service", () => ({
  vacancyService: {
    search: vi.fn(),
    get: vi.fn(),
  },
}));

import { vacancyService } from "../service";
const mockedService = vi.mocked(vacancyService);

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Vacancy ${i + 1}`,
    employer: null,
    salary: null,
    salary_range: null,
    area: { id: "1", name: "Москва", url: null },
    snippet: { requirement: null, responsibility: null },
    published_at: "2025-01-01T00:00:00+0300",
    alternate_url: "https://hh.ru/vacancy/1",
    experience: null,
    employment_form: null,
  }));

describe("useVacancySearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService.search.mockResolvedValue({ items: [], found: 0, page: 0, pages: 0, per_page: 30 });
  });

  it("auto-searches on mount", async () => {
    renderHook(() => useVacancySearch());
    await waitFor(() => expect(mockedService.search).toHaveBeenCalled());
    expect(mockedService.search).toHaveBeenCalledWith({ page: 0, per_page: 30 });
  });

  it("search resets list and page", async () => {
    mockedService.search.mockResolvedValue({ items: makeItems(5), found: 5, page: 0, pages: 1, per_page: 30 });
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.search({ text: "python" }));
    expect(mockedService.search).toHaveBeenLastCalledWith({ text: "python", page: 0, per_page: 30 });
    expect(result.current.vacancies).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it("sets hasMore=true when full page returned", async () => {
    mockedService.search.mockResolvedValue({ items: makeItems(30), found: 100, page: 0, pages: 4, per_page: 30 });
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.hasMore).toBe(true));
  });

  it("loadMore appends items", async () => {
    mockedService.search
      .mockResolvedValueOnce({ items: makeItems(30), found: 60, page: 0, pages: 2, per_page: 30 })
      .mockResolvedValueOnce({ items: makeItems(30), found: 60, page: 1, pages: 2, per_page: 30 });
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.vacancies).toHaveLength(30));
    await act(() => result.current.loadMore());
    expect(result.current.vacancies).toHaveLength(60);
    expect(result.current.hasMore).toBe(false);
  });

  it("loadMore does nothing when hasMore=false", async () => {
    mockedService.search.mockResolvedValue({ items: makeItems(5), found: 5, page: 0, pages: 1, per_page: 30 });
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
    const callCount = mockedService.search.mock.calls.length;
    await act(() => result.current.loadMore());
    expect(mockedService.search).toHaveBeenCalledTimes(callCount);
  });

  it("select loads vacancy detail", async () => {
    mockedService.search.mockResolvedValue({ items: makeItems(1), found: 1, page: 0, pages: 1, per_page: 30 });
    const detail = { id: "1", name: "Vacancy 1", description: "desc", key_skills: [], experience: null, area: { id: "1", name: "Москва", url: null }, employer: null, salary: null, salary_range: null, snippet: { requirement: null, responsibility: null }, published_at: "2025-01-01T00:00:00+0300", alternate_url: "", address: null, employment_form: null, work_format: null, schedule: null };
    mockedService.get.mockResolvedValue(detail as any);
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.vacancies).toHaveLength(1));
    await act(() => result.current.select("1"));
    expect(result.current.selectedId).toBe("1");
    expect(result.current.vacancy).toEqual(detail);
    expect(result.current.loadingDetail).toBe(false);
  });

  it("select does nothing for same id", async () => {
    mockedService.search.mockResolvedValue({ items: makeItems(1), found: 1, page: 0, pages: 1, per_page: 30 });
    mockedService.get.mockResolvedValue({ id: "1" } as any);
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.vacancies).toHaveLength(1));
    await act(() => result.current.select("1"));
    const callCount = mockedService.get.mock.calls.length;
    await act(() => result.current.select("1"));
    expect(mockedService.get).toHaveBeenCalledTimes(callCount);
  });

  it("sets error on search failure", async () => {
    mockedService.search.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useVacancySearch());
    await waitFor(() => expect(result.current.error).toBe("fail"));
    expect(result.current.loading).toBe(false);
  });
});
