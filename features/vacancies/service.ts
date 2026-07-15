import { ApiError, apiRequest } from "@/lib/api-client";
import type { VacancyDetail, VacancyListItem, VacancySearchParams, VacancySearchResponse } from "./types";

const root = "/api/vacancies";

function normalized(error: unknown): never {
  if (error instanceof ApiError) throw error;
  throw new ApiError("Не удалось выполнить поиск вакансий.");
}

export const vacancyService = {
  async search(params: VacancySearchParams = {}): Promise<VacancySearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === "") continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            searchParams.append(key, String(item));
          }
        } else {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      return (await apiRequest<VacancySearchResponse>(`${root}${qs ? `?${qs}` : ""}`)) ?? { items: [], found: 0, page: 0, pages: 0, per_page: 30 };
    } catch (error) {
      return normalized(error);
    }
  },

  async get(vacancyId: string): Promise<VacancyDetail> {
    try {
      return (await apiRequest<VacancyDetail>(`${root}/${encodeURIComponent(vacancyId)}`))!;
    } catch (error) {
      return normalized(error);
    }
  },
};
