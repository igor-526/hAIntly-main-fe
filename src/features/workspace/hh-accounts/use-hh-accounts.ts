"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { hhAccountService } from "./service";
import type { HhAccount, HhOAuthMessage } from "./types";

type State = {
  accounts: HhAccount[];
  activeId: string | null;
  loading: boolean;
  pending: boolean;
  error?: string;
};

export function useHhAccounts() {
  const [state, setState] = useState<State>({
    accounts: [],
    activeId: null,
    loading: true,
    pending: false,
  });
  const popup = useRef<Window | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: undefined }));
    try {
      const data = await hhAccountService.list();
      setState({
        accounts: data.accounts,
        activeId: data.active_account_id,
        loading: false,
        pending: false,
      });
    } catch (error) {
      setState((value) => ({
        ...value,
        loading: false,
        pending: false,
        error: error instanceof Error ? error.message : "Ошибка загрузки аккаунтов",
      }));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const connect = useCallback(async () => {
    setState((value) => ({ ...value, pending: true, error: undefined }));
    try {
      const url = await hhAccountService.start();
      const opened = window.open(url, "haintly-hh-oauth", "popup,width=620,height=760");
      if (!opened) throw new Error("Браузер заблокировал окно HH. Разрешите всплывающие окна и повторите.");
      popup.current = opened;
      timer.current = setInterval(() => {
        if (popup.current?.closed) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          popup.current = null;
          setState((value) => ({ ...value, pending: false }));
        }
      }, 300);
    } catch (error) {
      setState((value) => ({
        ...value,
        pending: false,
        error: error instanceof Error ? error.message : "Не удалось открыть HH",
      }));
    }
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent<HhOAuthMessage>) => {
      if (event.origin !== window.location.origin || event.source !== popup.current || event.data?.type !== "haintly:hh-oauth-success") return;
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      popup.current?.close();
      popup.current = null;
      void load();
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [load]);

  const select = useCallback(async (id: string) => {
    setState((value) => ({ ...value, pending: true, error: undefined }));
    try {
      const activeId = await hhAccountService.select(id);
      setState((value) => ({ ...value, activeId, pending: false }));
    } catch (error) {
      setState((value) => ({
        ...value,
        pending: false,
        error: error instanceof Error ? error.message : "Ошибка выбора аккаунта",
      }));
    }
  }, []);
  const remove = useCallback(
    async (id: string) => {
      setState((value) => ({ ...value, pending: true, error: undefined }));
      try {
        await hhAccountService.remove(id);
        await load();
        return true;
      } catch (error) {
        setState((value) => ({
          ...value,
          pending: false,
          error: error instanceof Error ? error.message : "Ошибка удаления аккаунта",
        }));
        return false;
      }
    },
    [load],
  );
  return { ...state, load, connect, select, remove };
}
