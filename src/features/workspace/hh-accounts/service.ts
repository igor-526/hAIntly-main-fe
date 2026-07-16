import { ApiError, apiRequest } from "@/api/main-be";
import type { HhAccount, HhAccountsSnapshot } from "./types";

const root = "/api/hh/accounts";

function normalized(error: unknown): never {
  if (error instanceof ApiError) throw error;
  throw new ApiError("Не удалось выполнить операцию с аккаунтом HH.");
}

export const hhAccountService = {
  async start(): Promise<string> {
    try {
      const result = await apiRequest<{ authorization_url: string }>("/api/hh/oauth/start", { method: "POST" });
      if (!result?.authorization_url) throw new ApiError("Сервер не вернул адрес авторизации HH.");
      return result.authorization_url;
    } catch (error) {
      return normalized(error);
    }
  },
  async callback(query: URLSearchParams): Promise<{ success: boolean; message?: string }> {
    const state = query.get("state");
    if (!state) throw new ApiError("Ответ HH не содержит данных для завершения входа.");
    const payload = {
      state,
      ...(query.get("code") ? { code: query.get("code")! } : {}),
      ...(query.get("error") ? { error: query.get("error")! } : {}),
    };
    try {
      return (await apiRequest<{ success: boolean; message?: string }>("/api/hh/oauth/callback", {
        method: "POST",
        body: JSON.stringify(payload),
      }))!;
    } catch (error) {
      normalized(error);
    }
  },
  async list(): Promise<HhAccountsSnapshot> {
    try {
      return (
        (await apiRequest<HhAccountsSnapshot>(root)) ?? {
          accounts: [],
          active_account_id: null,
        }
      );
    } catch (error) {
      return normalized(error);
    }
  },
  async get(id: string): Promise<HhAccount> {
    try {
      return (await apiRequest<HhAccount>(`${root}/${encodeURIComponent(id)}`))!;
    } catch (error) {
      return normalized(error);
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await apiRequest(`${root}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (error) {
      return normalized(error);
    }
  },
  async select(id: string): Promise<string> {
    try {
      return (await apiRequest<{ active_account_id: string }>(`${root}/active`, {
        method: "PUT",
        body: JSON.stringify({ account_id: id }),
      }))!.active_account_id;
    } catch (error) {
      return normalized(error);
    }
  },
};
