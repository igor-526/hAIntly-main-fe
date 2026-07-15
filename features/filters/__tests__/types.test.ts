"use client";

import { describe, it, expect } from "vitest";
import { presetToFormData, formDataToPayload, EMPTY_FORM } from "../types";
import type { FilterPreset } from "../types";

describe("presetToFormData", () => {
  it("converts preset with scalar and multi-select values", () => {
    const preset: FilterPreset = {
      id: "1", name: "Test", text: "hello", excluded_text: "bad", salary: 100000,
      currency: "RUR", salary_mode: "after_tax", period: 7, date_from: "2024-01-01", date_to: null,
      order_by: "relevance", premium: true, accept_temporary: false, no_magic: null,
      top_lat: 55.0, bottom_lat: 54.0, left_lng: 37.0, right_lng: 38.0,
      sort_point_lat: null, sort_point_lng: null, responses_count_enabled: null,
      hh_user_id: "123", created_at: "", updated_at: null,
      values: [
        { parameter_name: "area", value: "1" },
        { parameter_name: "area", value: "2" },
        { parameter_name: "experience", value: "3" },
      ],
    };
    const form = presetToFormData(preset);
    expect(form.name).toBe("Test");
    expect(form.text).toBe("hello");
    expect(form.salary).toBe("100000");
    expect(form.period).toBe("7");
    expect(form.premium).toBe(true);
    expect(form.accept_temporary).toBe(false);
    expect(form.area).toEqual(["1", "2"]);
    expect(form.experience).toEqual(["3"]);
    expect(form.top_lat).toBe("55");
  });

  it("handles nulls gracefully", () => {
    const preset: FilterPreset = {
      id: "1", name: "Test", text: null, excluded_text: null, salary: null,
      currency: null, salary_mode: null, period: null, date_from: null, date_to: null,
      order_by: null, premium: null, accept_temporary: null, no_magic: null,
      top_lat: null, bottom_lat: null, left_lng: null, right_lng: null,
      sort_point_lat: null, sort_point_lng: null, responses_count_enabled: null,
      hh_user_id: "123", created_at: "", updated_at: null, values: [],
    };
    const form = presetToFormData(preset);
    expect(form.text).toBe("");
    expect(form.salary).toBe("");
    expect(form.premium).toBe(false);
    expect(form.area).toEqual([]);
  });
});

describe("formDataToPayload", () => {
  it("converts form data to API payload", () => {
    const form = { ...EMPTY_FORM, name: "Test", text: "hello", salary: "100000", area: ["1", "2"], premium: true };
    const payload = formDataToPayload(form);
    expect(payload.name).toBe("Test");
    expect(payload.text).toBe("hello");
    expect(payload.salary).toBe(100000);
    expect(payload.premium).toBe(true);
    expect(payload.values).toEqual([
      { parameter_name: "area", value: "1" },
      { parameter_name: "area", value: "2" },
    ]);
  });

  it("omits empty strings and false booleans", () => {
    const form = { ...EMPTY_FORM, name: "Test" };
    const payload = formDataToPayload(form);
    expect(payload.text).toBeUndefined();
    expect(payload.salary).toBeUndefined();
    expect(payload.premium).toBeUndefined();
    expect(payload.values).toBeUndefined();
  });
});
