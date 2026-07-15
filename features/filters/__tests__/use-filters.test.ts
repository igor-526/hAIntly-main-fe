"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "../use-filters";
import { EMPTY_FORM } from "../types";

vi.mock("../service", () => ({
  filterService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { filterService } from "../service";
const mockedService = vi.mocked(filterService);

describe("useFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.presets).toEqual([]);
    expect(result.current.selectedPresetId).toBeNull();
    expect(result.current.form).toEqual(EMPTY_FORM);
    expect(result.current.loading).toBe(false);
    expect(result.current.saving).toBe(false);
  });

  describe("loadPresets", () => {
    it("loads presets from service", async () => {
      mockedService.list.mockResolvedValue({ items: [{ id: "1", name: "Preset 1" }], limit: 50, offset: 0 });
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.loadPresets());
      expect(result.current.presets).toEqual([{ id: "1", name: "Preset 1" }]);
      expect(result.current.loading).toBe(false);
    });

    it("sets error on failure", async () => {
      mockedService.list.mockRejectedValue(new Error("fail"));
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.loadPresets());
      expect(result.current.error).toBe("fail");
    });
  });

  describe("selectPreset", () => {
    it("resets form when null", async () => {
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.selectPreset(null));
      expect(result.current.selectedPresetId).toBeNull();
      expect(result.current.form).toEqual(EMPTY_FORM);
    });

    it("loads preset and fills form", async () => {
      const preset = {
        id: "1", name: "Test", text: "hello", excluded_text: null, salary: 100000,
        currency: "RUR", salary_mode: null, period: 7, date_from: null, date_to: null,
        order_by: null, premium: null, accept_temporary: null, no_magic: null,
        top_lat: null, bottom_lat: null, left_lng: null, right_lng: null,
        sort_point_lat: null, sort_point_lng: null, responses_count_enabled: null,
        hh_user_id: "123", created_at: "", updated_at: null,
        values: [{ parameter_name: "area", value: "1" }],
      };
      mockedService.get.mockResolvedValue(preset);
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.selectPreset("1"));
      expect(result.current.selectedPresetId).toBe("1");
      expect(result.current.form.text).toBe("hello");
      expect(result.current.form.salary).toBe("100000");
      expect(result.current.form.area).toEqual(["1"]);
      expect(result.current.form.period).toBe("7");
    });
  });

  describe("updateForm", () => {
    it("merges partial form data", () => {
      const { result } = renderHook(() => useFilters());
      act(() => result.current.updateForm({ text: "new text" }));
      expect(result.current.form.text).toBe("new text");
      expect(result.current.form.name).toBe("");
    });
  });

  describe("resetForm", () => {
    it("clears form and selected preset", () => {
      const { result } = renderHook(() => useFilters());
      act(() => result.current.updateForm({ text: "something" }));
      act(() => result.current.resetForm());
      expect(result.current.form).toEqual(EMPTY_FORM);
      expect(result.current.selectedPresetId).toBeNull();
    });
  });

  describe("savePreset", () => {
    it("creates new preset when none selected", async () => {
      mockedService.create.mockResolvedValue({ id: "new", name: "New" } as any);
      mockedService.list.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      const { result } = renderHook(() => useFilters());
      act(() => result.current.updateForm({ name: "New" }));
      const ok = await act(() => result.current.savePreset());
      expect(ok).toBe(true);
      expect(mockedService.create).toHaveBeenCalled();
      expect(result.current.selectedPresetId).toBe("new");
    });

    it("updates existing preset when selected", async () => {
      mockedService.update.mockResolvedValue({ id: "1", name: "Updated" } as any);
      mockedService.list.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      mockedService.get.mockResolvedValue({
        id: "1", name: "Old", text: null, excluded_text: null, salary: null,
        currency: null, salary_mode: null, period: null, date_from: null, date_to: null,
        order_by: null, premium: null, accept_temporary: null, no_magic: null,
        top_lat: null, bottom_lat: null, left_lng: null, right_lng: null,
        sort_point_lat: null, sort_point_lng: null, responses_count_enabled: null,
        hh_user_id: "123", created_at: "", updated_at: null, values: [],
      });
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.selectPreset("1"));
      const ok = await act(() => result.current.savePreset());
      expect(ok).toBe(true);
      expect(mockedService.update).toHaveBeenCalledWith("1", expect.objectContaining({ name: "Old" }));
    });
  });

  describe("renamePreset", () => {
    it("renames preset via service", async () => {
      mockedService.update.mockResolvedValue({ id: "1", name: "New" } as any);
      mockedService.list.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      const { result } = renderHook(() => useFilters());
      const ok = await act(() => result.current.renamePreset("1", "New"));
      expect(ok).toBe(true);
      expect(mockedService.update).toHaveBeenCalledWith("1", { name: "New" });
    });
  });

  describe("deletePreset", () => {
    it("deletes preset via service", async () => {
      mockedService.remove.mockResolvedValue(undefined);
      mockedService.list.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      const { result } = renderHook(() => useFilters());
      const ok = await act(() => result.current.deletePreset("1"));
      expect(ok).toBe(true);
      expect(mockedService.remove).toHaveBeenCalledWith("1");
    });

    it("resets selection if deleted preset was selected", async () => {
      mockedService.remove.mockResolvedValue(undefined);
      mockedService.list.mockResolvedValue({ items: [], limit: 50, offset: 0 });
      mockedService.get.mockResolvedValue({
        id: "1", name: "Test", text: null, excluded_text: null, salary: null,
        currency: null, salary_mode: null, period: null, date_from: null, date_to: null,
        order_by: null, premium: null, accept_temporary: null, no_magic: null,
        top_lat: null, bottom_lat: null, left_lng: null, right_lng: null,
        sort_point_lat: null, sort_point_lng: null, responses_count_enabled: null,
        hh_user_id: "123", created_at: "", updated_at: null, values: [],
      });
      const { result } = renderHook(() => useFilters());
      await act(() => result.current.selectPreset("1"));
      await act(() => result.current.deletePreset("1"));
      expect(result.current.selectedPresetId).toBeNull();
    });
  });
});
