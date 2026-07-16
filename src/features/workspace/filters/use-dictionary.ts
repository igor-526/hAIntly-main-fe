"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dictionaryService } from "./dictionary-service";
import type { DictionaryItem } from "./types";

type DictionaryState = { items: DictionaryItem[]; loading: boolean };
const initialState: DictionaryState = { items: [], loading: false };

function useDictionaryLoader(loadItems: (query?: string) => Promise<DictionaryItem[]>) {
  const [state, setState] = useState<DictionaryState>(initialState);
  const loaded = useRef(false);
  const load = useCallback(
    async (query?: string) => {
      setState((value) => ({ ...value, loading: true }));
      try {
        setState({ items: await loadItems(query), loading: false });
      } catch {
        setState((value) => ({ ...value, loading: false }));
      }
    },
    [loadItems],
  );
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      void load();
    }
  }, [load]);
  return { ...state, load };
}

export function useDictionary(path: string) {
  const loadItems = useCallback((query?: string) => dictionaryService.list(path, query), [path]);
  return useDictionaryLoader(loadItems);
}

export function useDictionaryItems(code: string) {
  const loadItems = useCallback((query?: string) => dictionaryService.listItems(code, query), [code]);
  return useDictionaryLoader(loadItems);
}
