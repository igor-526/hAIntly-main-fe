"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vacancyService } from "./service";
import type { VacancyDetail, VacancyListItem, VacancySearchParams } from "./types";

type State = {
  vacancies: VacancyListItem[];
  selectedId: string | null;
  vacancy: VacancyDetail | null;
  loading: boolean;
  loadingMore: boolean;
  loadingDetail: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
};

const PER_PAGE = 30;

export function useVacancySearch() {
  const [state, setState] = useState<State>({
    vacancies: [],
    selectedId: null,
    vacancy: null,
    loading: false,
    loadingMore: false,
    loadingDetail: false,
    error: null,
    page: 0,
    hasMore: false,
  });
  const paramsRef = useRef<VacancySearchParams>({});

  const search = useCallback(async (params: VacancySearchParams = {}) => {
    paramsRef.current = params;
    setState((s) => ({ ...s, loading: true, loadingMore: false, error: null, vacancies: [], page: 0, hasMore: false, selectedId: null, vacancy: null }));
    try {
      const data = await vacancyService.search({ ...params, page: 0, per_page: PER_PAGE });
      setState((s) => ({
        ...s,
        vacancies: data.items,
        loading: false,
        page: 0,
        hasMore: data.items.length >= PER_PAGE && data.page < data.pages - 1,
      }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error.message : "Ошибка поиска вакансий" }));
    }
  }, []);

  const loadMore = useCallback(async () => {
    setState((s) => {
      if (!s.hasMore || s.loading || s.loadingMore) return s;
      return { ...s, loadingMore: true };
    });
    const snapshot = state;
    if (!snapshot.hasMore || snapshot.loading || snapshot.loadingMore) return;
    const nextPage = snapshot.page + 1;
    try {
      const data = await vacancyService.search({ ...paramsRef.current, page: nextPage, per_page: PER_PAGE });
      setState((s) => ({
        ...s,
        vacancies: [...s.vacancies, ...data.items],
        loadingMore: false,
        page: nextPage,
        hasMore: data.items.length >= PER_PAGE && data.page < data.pages - 1,
      }));
    } catch (error) {
      setState((s) => ({ ...s, loadingMore: false, error: error instanceof Error ? error.message : "Ошибка подгрузки вакансий" }));
    }
  }, [state]);

  const select = useCallback(async (id: string) => {
    if (state.selectedId === id) return;
    setState((s) => ({ ...s, selectedId: id, vacancy: null, loadingDetail: true }));
    try {
      const detail = await vacancyService.get(id);
      setState((s) => ({ ...s, vacancy: detail, loadingDetail: false }));
    } catch (error) {
      setState((s) => ({ ...s, loadingDetail: false, error: error instanceof Error ? error.message : "Ошибка загрузки деталей вакансии" }));
    }
  }, [state.selectedId]);

  useEffect(() => {
    void search();
  }, [search]);

  return {
    ...state,
    search,
    loadMore,
    select,
  };
}
