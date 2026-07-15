"use client";

export type FilterValue = {
  parameter_name: string;
  value: string;
};

export const MULTI_SELECT_PARAMETERS = [
  "search_field",
  "area",
  "metro",
  "professional_role",
  "industry",
  "employer_id",
  "experience",
  "employment_form",
  "education",
  "work_schedule_by_days",
  "working_hours",
  "work_format",
  "salary_frequency",
  "label",
  "driver_license_types",
] as const;

export type MultiSelectParameter = (typeof MULTI_SELECT_PARAMETERS)[number];

export type FilterPresetListItem = {
  id: string;
  name: string;
};

export type FilterPresetListResponse = {
  items: FilterPresetListItem[];
  limit: number;
  offset: number;
};

export type FilterPreset = {
  id: string;
  name: string;
  text: string | null;
  excluded_text: string | null;
  salary: number | null;
  currency: string | null;
  salary_mode: string | null;
  period: number | null;
  date_from: string | null;
  date_to: string | null;
  order_by: string | null;
  premium: boolean | null;
  accept_temporary: boolean | null;
  no_magic: boolean | null;
  top_lat: number | null;
  bottom_lat: number | null;
  left_lng: number | null;
  right_lng: number | null;
  sort_point_lat: number | null;
  sort_point_lng: number | null;
  responses_count_enabled: boolean | null;
  hh_user_id: string;
  created_at: string;
  updated_at: string | null;
  values: FilterValue[];
};

export type FilterPresetFormData = {
  name: string;
  text: string;
  excluded_text: string;
  salary: string;
  currency: string;
  salary_mode: string;
  period: string;
  date_from: string;
  date_to: string;
  order_by: string;
  premium: boolean;
  accept_temporary: boolean;
  no_magic: boolean;
  responses_count_enabled: boolean;
  top_lat: string;
  bottom_lat: string;
  left_lng: string;
  right_lng: string;
  sort_point_lat: string;
  sort_point_lng: string;
  search_field: string[];
  area: string[];
  metro: string[];
  professional_role: string[];
  industry: string[];
  employer_id: string[];
  experience: string[];
  employment_form: string[];
  education: string[];
  work_schedule_by_days: string[];
  working_hours: string[];
  work_format: string[];
  salary_frequency: string[];
  label: string[];
  driver_license_types: string[];
};

export type DictionaryItem = {
  id: string;
  name: string;
};

export type DictionaryResponse = {
  items: DictionaryItem[];
};

export const EMPTY_FORM: FilterPresetFormData = {
  name: "",
  text: "",
  excluded_text: "",
  salary: "",
  currency: "",
  salary_mode: "",
  period: "",
  date_from: "",
  date_to: "",
  order_by: "",
  premium: false,
  accept_temporary: false,
  no_magic: false,
  responses_count_enabled: false,
  top_lat: "",
  bottom_lat: "",
  left_lng: "",
  right_lng: "",
  sort_point_lat: "",
  sort_point_lng: "",
  search_field: [],
  area: [],
  metro: [],
  professional_role: [],
  industry: [],
  employer_id: [],
  experience: [],
  employment_form: [],
  education: [],
  work_schedule_by_days: [],
  working_hours: [],
  work_format: [],
  salary_frequency: [],
  label: [],
  driver_license_types: [],
};

export function presetToFormData(preset: FilterPreset): FilterPresetFormData {
  const valuesByParam = new Map<string, string[]>();
  for (const v of preset.values) {
    const arr = valuesByParam.get(v.parameter_name) ?? [];
    arr.push(v.value);
    valuesByParam.set(v.parameter_name, arr);
  }
  const multi = (param: string): string[] => valuesByParam.get(param) ?? [];
  const scalar = (v: unknown): string => (v == null ? "" : String(v));
  return {
    name: preset.name,
    text: scalar(preset.text),
    excluded_text: scalar(preset.excluded_text),
    salary: scalar(preset.salary),
    currency: scalar(preset.currency),
    salary_mode: scalar(preset.salary_mode),
    period: scalar(preset.period),
    date_from: scalar(preset.date_from),
    date_to: scalar(preset.date_to),
    order_by: scalar(preset.order_by),
    premium: preset.premium ?? false,
    accept_temporary: preset.accept_temporary ?? false,
    no_magic: preset.no_magic ?? false,
    responses_count_enabled: preset.responses_count_enabled ?? false,
    top_lat: scalar(preset.top_lat),
    bottom_lat: scalar(preset.bottom_lat),
    left_lng: scalar(preset.left_lng),
    right_lng: scalar(preset.right_lng),
    sort_point_lat: scalar(preset.sort_point_lat),
    sort_point_lng: scalar(preset.sort_point_lng),
    search_field: multi("search_field"),
    area: multi("area"),
    metro: multi("metro"),
    professional_role: multi("professional_role"),
    industry: multi("industry"),
    employer_id: multi("employer_id"),
    experience: multi("experience"),
    employment_form: multi("employment_form"),
    education: multi("education"),
    work_schedule_by_days: multi("work_schedule_by_days"),
    working_hours: multi("working_hours"),
    work_format: multi("work_format"),
    salary_frequency: multi("salary_frequency"),
    label: multi("label"),
    driver_license_types: multi("driver_license_types"),
  };
}

export function formDataToPayload(form: FilterPresetFormData): Record<string, unknown> {
  const num = (v: string): number | undefined => (v === "" ? undefined : Number(v));
  const str = (v: string): string | undefined => (v === "" ? undefined : v);
  const values: FilterValue[] = [];
  for (const param of MULTI_SELECT_PARAMETERS) {
    for (const val of form[param]) {
      values.push({ parameter_name: param, value: val });
    }
  }
  return {
    name: form.name,
    text: str(form.text),
    excluded_text: str(form.excluded_text),
    salary: num(form.salary),
    currency: str(form.currency),
    salary_mode: str(form.salary_mode),
    period: num(form.period),
    date_from: str(form.date_from),
    date_to: str(form.date_to),
    order_by: str(form.order_by),
    premium: form.premium || undefined,
    accept_temporary: form.accept_temporary || undefined,
    no_magic: form.no_magic || undefined,
    responses_count_enabled: form.responses_count_enabled || undefined,
    top_lat: num(form.top_lat),
    bottom_lat: num(form.bottom_lat),
    left_lng: num(form.left_lng),
    right_lng: num(form.right_lng),
    sort_point_lat: num(form.sort_point_lat),
    sort_point_lng: num(form.sort_point_lng),
    values: values.length > 0 ? values : undefined,
  };
}
