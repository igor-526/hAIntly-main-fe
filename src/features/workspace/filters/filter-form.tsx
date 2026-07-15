"use client";

import { useCallback, useMemo, useRef } from "react";
import { Autocomplete, Checkbox, Chip, FormControl, FormControlLabel, FormGroup, FormLabel, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { DictionaryItem, FilterPresetFormData } from "./types";
import { useDictionary, useDictionaryItems } from "./use-dictionary";

type FilterFormProps = {
  form: FilterPresetFormData;
  onChange: (patch: Partial<FilterPresetFormData>) => void;
  disabled?: boolean;
};

function MultiDictSelect({ label, value, items, loading, onChange, onSearch }: {
  label: string; value: string[]; items: DictionaryItem[]; loading: boolean;
  onChange: (val: string[]) => void; onSearch?: (q: string) => void;
}) {
  const selected = useMemo(() => items.filter((i) => value.includes(i.id)), [items, value]);
  return (
    <Autocomplete
      multiple
      options={items}
      value={selected}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, val) => onChange(val.map((v) => v.id))}
      onInputChange={(_, val) => onSearch?.(val)}
      loading={loading}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} label={option.name} size="small" {...tagProps} />;
        })
      }
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
      noOptionsText="Нет вариантов"
      loadingText="Загрузка…"
      size="small"
    />
  );
}

function SingleDictSelect({ label, value, items, loading, onChange, onSearch }: {
  label: string; value: string; items: DictionaryItem[]; loading: boolean;
  onChange: (val: string) => void; onSearch?: (q: string) => void;
}) {
  const selected = useMemo(() => items.find((i) => i.id === value) ?? null, [items, value]);
  return (
    <Autocomplete
      options={items}
      value={selected}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, val) => onChange(val?.id ?? "")}
      onInputChange={(_, val) => onSearch?.(val)}
      loading={loading}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
      noOptionsText="Нет вариантов"
      loadingText="Загрузка…"
      size="small"
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{children}</Typography>;
}

export function FilterForm({ form, onChange, disabled }: FilterFormProps) {
  const experience = useDictionary("/api/dictionaries/experience");
  const areas = useDictionary("/api/dictionaries/areas");
  const professionalRoles = useDictionary("/api/dictionaries/professional-roles");
  const industries = useDictionary("/api/dictionaries/industries");
  const metroStations = useDictionary("/api/dictionaries/metro-stations");

  const searchFields = useDictionaryItems("vacancy_search_fields");
  const employmentForms = useDictionaryItems("vacancy_search_employment_form");
  const workFormats = useDictionaryItems("work_format");
  const workScheduleByDays = useDictionaryItems("work_schedule_by_days");
  const workingHours = useDictionaryItems("working_hours");
  const vacancyLabels = useDictionaryItems("vacancy_label");
  const salaryFrequencies = useDictionaryItems("salary_range_frequency");
  const salaryModes = useDictionaryItems("salary_range_mode");
  const driverLicenseTypes = useDictionaryItems("driver_license_types");
  const education = useDictionaryItems("education");
  const orderBy = useDictionaryItems("vacancy_search_order");

  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const debouncedSearch = useCallback((key: string, fn: (q: string) => void, q: string) => {
    const existing = debounceTimers.current.get(key);
    if (existing) clearTimeout(existing);
    debounceTimers.current.set(key, setTimeout(() => fn(q), 300));
  }, []);

  return (
    <Stack spacing={0}>
      {/* Text search */}
      <SectionTitle>Текст поиска</SectionTitle>
      <Stack spacing={1.5}>
        <TextField label="Текст поиска" value={form.text} onChange={(e) => onChange({ text: e.target.value })} size="small" fullWidth disabled={disabled} />
        <TextField label="Исключаемый текст" value={form.excluded_text} onChange={(e) => onChange({ excluded_text: e.target.value })} size="small" fullWidth disabled={disabled} />
        <MultiDictSelect label="Область поиска" value={form.search_field} items={searchFields.items} loading={searchFields.loading} onChange={(val) => onChange({ search_field: val })} onSearch={(q) => debouncedSearch("search_field", searchFields.load, q)} />
      </Stack>

      {/* Location */}
      <SectionTitle>Местоположение</SectionTitle>
      <Stack spacing={1.5}>
        <MultiDictSelect label="Регион" value={form.area} items={areas.items} loading={areas.loading} onChange={(val) => onChange({ area: val })} onSearch={(q) => debouncedSearch("areas", areas.load, q)} />
        <MultiDictSelect label="Метро" value={form.metro} items={metroStations.items} loading={metroStations.loading} onChange={(val) => onChange({ metro: val })} onSearch={(q) => debouncedSearch("metro", metroStations.load, q)} />
        <Stack direction="row" spacing={1}>
          <TextField label="Широта (верх)" value={form.top_lat} onChange={(e) => onChange({ top_lat: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
          <TextField label="Широта (низ)" value={form.bottom_lat} onChange={(e) => onChange({ bottom_lat: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField label="Долгота (лево)" value={form.left_lng} onChange={(e) => onChange({ left_lng: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
          <TextField label="Долгота (право)" value={form.right_lng} onChange={(e) => onChange({ right_lng: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
        </Stack>
      </Stack>

      {/* Professional / Industry */}
      <SectionTitle>Профессия и отрасль</SectionTitle>
      <Stack spacing={1.5}>
        <MultiDictSelect label="Профессиональная роль" value={form.professional_role} items={professionalRoles.items} loading={professionalRoles.loading} onChange={(val) => onChange({ professional_role: val })} onSearch={(q) => debouncedSearch("proles", professionalRoles.load, q)} />
        <MultiDictSelect label="Отрасль" value={form.industry} items={industries.items} loading={industries.loading} onChange={(val) => onChange({ industry: val })} onSearch={(q) => debouncedSearch("industries", industries.load, q)} />
        <TextField label="ID работодателя" value={form.employer_id} onChange={(e) => onChange({ employer_id: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : [] })} size="small" fullWidth disabled={disabled} helperText="Через запятую" />
      </Stack>

      {/* Work conditions */}
      <SectionTitle>Условия работы</SectionTitle>
      <Stack spacing={1.5}>
        <MultiDictSelect label="Опыт" value={form.experience} items={experience.items} loading={experience.loading} onChange={(val) => onChange({ experience: val })} />
        <MultiDictSelect label="Тип занятости" value={form.employment_form} items={employmentForms.items} loading={employmentForms.loading} onChange={(val) => onChange({ employment_form: val })} onSearch={(q) => debouncedSearch("employment_form", employmentForms.load, q)} />
        <MultiDictSelect label="Образование" value={form.education} items={education.items} loading={education.loading} onChange={(val) => onChange({ education: val })} onSearch={(q) => debouncedSearch("education", education.load, q)} />
        <MultiDictSelect label="График работы" value={form.work_schedule_by_days} items={workScheduleByDays.items} loading={workScheduleByDays.loading} onChange={(val) => onChange({ work_schedule_by_days: val })} onSearch={(q) => debouncedSearch("work_schedule", workScheduleByDays.load, q)} />
        <MultiDictSelect label="Рабочие часы" value={form.working_hours} items={workingHours.items} loading={workingHours.loading} onChange={(val) => onChange({ working_hours: val })} onSearch={(q) => debouncedSearch("working_hours", workingHours.load, q)} />
        <MultiDictSelect label="Формат работы" value={form.work_format} items={workFormats.items} loading={workFormats.loading} onChange={(val) => onChange({ work_format: val })} onSearch={(q) => debouncedSearch("work_format", workFormats.load, q)} />
      </Stack>

      {/* Salary */}
      <SectionTitle>Зарплата</SectionTitle>
      <Stack spacing={1.5}>
        <TextField label="Зарплата" value={form.salary} onChange={(e) => onChange({ salary: e.target.value })} size="small" type="number" fullWidth disabled={disabled} InputProps={{ startAdornment: <InputAdornment position="start">₽</InputAdornment> }} />
        <TextField label="Валюта" value={form.currency} onChange={(e) => onChange({ currency: e.target.value })} size="small" fullWidth disabled={disabled} />
        <MultiDictSelect label="Частота зарплаты" value={form.salary_frequency} items={salaryFrequencies.items} loading={salaryFrequencies.loading} onChange={(val) => onChange({ salary_frequency: val })} onSearch={(q) => debouncedSearch("salary_freq", salaryFrequencies.load, q)} />
        <SingleDictSelect label="Режим зарплаты" value={form.salary_mode} items={salaryModes.items} loading={salaryModes.loading} onChange={(val) => onChange({ salary_mode: val })} onSearch={(q) => debouncedSearch("salary_mode", salaryModes.load, q)} />
      </Stack>

      {/* Labels / Additional */}
      <SectionTitle>Метки и дополнительные</SectionTitle>
      <Stack spacing={1.5}>
        <MultiDictSelect label="Метки" value={form.label} items={vacancyLabels.items} loading={vacancyLabels.loading} onChange={(val) => onChange({ label: val })} onSearch={(q) => debouncedSearch("labels", vacancyLabels.load, q)} />
        <MultiDictSelect label="Водительское удостоверение" value={form.driver_license_types} items={driverLicenseTypes.items} loading={driverLicenseTypes.loading} onChange={(val) => onChange({ driver_license_types: val })} onSearch={(q) => debouncedSearch("driver_license", driverLicenseTypes.load, q)} />
        <FormControl size="small" fullWidth>
          <FormLabel sx={{ fontSize: "0.75rem" }}>Период (дней)</FormLabel>
          <Select value={form.period} onChange={(e) => onChange({ period: e.target.value })} displayEmpty disabled={disabled}>
            <MenuItem value="">Не задан</MenuItem>
            <MenuItem value="1">За сутки</MenuItem>
            <MenuItem value="3">За 3 дня</MenuItem>
            <MenuItem value="7">За неделю</MenuItem>
            <MenuItem value="14">За 2 недели</MenuItem>
            <MenuItem value="30">За месяц</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Дата от" value={form.date_from} onChange={(e) => onChange({ date_from: e.target.value })} size="small" type="date" fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Дата до" value={form.date_to} onChange={(e) => onChange({ date_to: e.target.value })} size="small" type="date" fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <SingleDictSelect label="Сортировка" value={form.order_by} items={orderBy.items} loading={orderBy.loading} onChange={(val) => onChange({ order_by: val })} onSearch={(q) => debouncedSearch("order_by", orderBy.load, q)} />
        <Stack direction="row" spacing={1}>
          <TextField label="Широта (сортировка)" value={form.sort_point_lat} onChange={(e) => onChange({ sort_point_lat: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
          <TextField label="Долгота (сортировка)" value={form.sort_point_lng} onChange={(e) => onChange({ sort_point_lng: e.target.value })} size="small" type="number" fullWidth disabled={disabled} />
        </Stack>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={form.premium} onChange={(e) => onChange({ premium: e.target.checked })} disabled={disabled} />} label="Только премиум" />
          <FormControlLabel control={<Checkbox checked={form.accept_temporary} onChange={(e) => onChange({ accept_temporary: e.target.checked })} disabled={disabled} />} label="Временная работа" />
          <FormControlLabel control={<Checkbox checked={form.no_magic} onChange={(e) => onChange({ no_magic: e.target.checked })} disabled={disabled} />} label="Без магии поиска" />
          <FormControlLabel control={<Checkbox checked={form.responses_count_enabled} onChange={(e) => onChange({ responses_count_enabled: e.target.checked })} disabled={disabled} />} label="Показывать количество откликов" />
        </FormGroup>
      </Stack>
    </Stack>
  );
}
