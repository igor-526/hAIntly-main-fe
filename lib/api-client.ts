export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); this.name = "ApiError"; }
}

function baseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!value) throw new ApiError("Не настроен адрес API.");
  return value;
}

function detailMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "msg" in item) return String(item.msg);
    return "Некорректные данные";
  }).join("; ");
  return "Запрос не выполнен";
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T | undefined> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init, credentials: "include",
      headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Не удалось связаться с сервером.");
  }
  if (!response.ok) {
    let message = "Запрос не выполнен";
    try { message = detailMessage((await response.json() as { detail?: unknown }).detail); } catch { /* safe fallback */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined;
  return await response.json() as T;
}
