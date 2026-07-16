import { beforeEach, describe, expect, it, vi } from "vitest";
import { hhAccountService } from "./service";
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);
const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
describe("hhAccountService", () => {
  beforeEach(() => fetchMock.mockReset());
  it("всегда вызывает main-be с cookie", async () => {
    fetchMock.mockImplementation(() => json({ accounts: [], active_account_id: null }));
    await hhAccountService.list();
    expect(fetchMock).toHaveBeenCalledWith("http://main-be.test/api/hh/accounts", expect.objectContaining({ credentials: "include" }));
  });
  it("сериализует callback только в body", async () => {
    fetchMock.mockImplementation(() => json({ success: true }));
    await hhAccountService.callback(new URLSearchParams("code=secret-code&state=secret-state"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain("secret");
    expect(JSON.parse(init.body)).toEqual({
      code: "secret-code",
      state: "secret-state",
    });
  });
  it("кодирует account id и нормализует backend error", async () => {
    fetchMock.mockImplementation(() => json({ detail: "Нет доступа" }, 403));
    await expect(hhAccountService.get("bad/id")).rejects.toMatchObject({
      message: "Нет доступа",
      status: 403,
    });
    expect(fetchMock.mock.calls[0][0]).toContain("bad%2Fid");
  });
  it("отклоняет callback без state до запроса", async () => {
    await expect(hhAccountService.callback(new URLSearchParams("code=x"))).rejects.toThrow("не содержит");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
