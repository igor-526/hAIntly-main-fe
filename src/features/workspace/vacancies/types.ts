export type VacancySalary = {
  from: number | null;
  to: number | null;
  currency: string | null;
  gross: boolean | null;
};

export type VacancyEmployer = {
  id: string;
  name: string;
  url: string | null;
  alternate_url: string | null;
  logo_urls: {
    original: string | null;
    "240": string | null;
    "90": string | null;
  } | null;
};

export type VacancyArea = {
  id: string;
  name: string;
  url: string | null;
};

export type VacancyExperience = {
  id: string;
  name: string;
};

export type VacancyEmploymentForm = {
  id: string;
  name: string;
};

export type VacancyWorkFormatItem = {
  id: string;
  name: string;
};

export type VacancySnippet = {
  requirement: string | null;
  responsibility: string | null;
};

export type VacancyListItem = {
  id: string;
  name: string;
  employer: VacancyEmployer | null;
  salary: VacancySalary | null;
  salary_range: VacancySalary | null;
  area: VacancyArea;
  snippet: VacancySnippet;
  published_at: string;
  alternate_url: string;
  experience: VacancyExperience | null;
  employment_form: VacancyEmploymentForm | null;
};

export type VacancyDetail = {
  id: string;
  name: string;
  employer: VacancyEmployer | null;
  salary: VacancySalary | null;
  salary_range: VacancySalary | null;
  area: VacancyArea;
  snippet: VacancySnippet;
  description: string | null;
  key_skills: { name: string }[];
  experience: VacancyExperience | null;
  employment_form: VacancyEmploymentForm | null;
  work_format: VacancyWorkFormatItem[] | null;
  schedule: { id: string; name: string } | null;
  published_at: string;
  alternate_url: string;
  address: { raw: string | null } | null;
};

export type VacancySearchResponse = {
  items: VacancyListItem[];
  found: number;
  page: number;
  pages: number;
  per_page: number;
};

export type VacancySearchParams = {
  preset_id?: string;
  page?: number;
  per_page?: number;
  [key: string]: string | string[] | number | undefined;
};
