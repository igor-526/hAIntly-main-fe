import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VacancyCard } from "../vacancy-card";
import { VacancyList } from "../vacancy-list";
import { VacancyDetailPanel } from "../vacancy-detail";
import type { VacancyDetail, VacancyListItem } from "../types";

const baseVacancy: VacancyListItem = {
  id: "1",
  name: "Python Developer",
  employer: { id: "1", name: "Яндекс", url: null, alternate_url: null, logo_urls: null },
  salary: { from: 100000, to: 200000, currency: "RUR", gross: false },
  salary_range: null,
  area: { id: "1", name: "Москва", url: null },
  snippet: { requirement: "Опыт от 3 лет", responsibility: "Разработка backend" },
  published_at: "2025-01-15T10:00:00+0300",
  alternate_url: "https://hh.ru/vacancy/1",
  experience: { id: "between1And3", name: "1–3 года" },
  employment_form: { id: "full", name: "Полная занятость" },
};

describe("VacancyCard", () => {
  it("renders vacancy name and employer", () => {
    render(<VacancyCard vacancy={baseVacancy} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText("Python Developer")).toBeInTheDocument();
    expect(screen.getByText("Яндекс")).toBeInTheDocument();
  });

  it("renders salary when present", () => {
    render(<VacancyCard vacancy={baseVacancy} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText(/100.*000.*200.*000/)).toBeInTheDocument();
  });

  it("hides salary when null", () => {
    const noSalary = { ...baseVacancy, salary: null };
    render(<VacancyCard vacancy={noSalary} selected={false} onClick={vi.fn()} />);
    expect(screen.queryByText(/от.*до/)).not.toBeInTheDocument();
  });

  it("renders area chip", () => {
    render(<VacancyCard vacancy={baseVacancy} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText("Москва")).toBeInTheDocument();
  });

  it("renders snippet", () => {
    render(<VacancyCard vacancy={baseVacancy} selected={false} onClick={vi.fn()} />);
    expect(screen.getByText("Разработка backend")).toBeInTheDocument();
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<VacancyCard vacancy={baseVacancy} selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("applies selected style", () => {
    render(<VacancyCard vacancy={baseVacancy} selected={true} onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveStyle({ borderColor: expect.anything() });
  });
});

describe("VacancyList", () => {
  it("shows loading state", () => {
    render(<VacancyList vacancies={[]} selectedId={null} loading={true} loadingMore={false} hasMore={false} error={null} onSelect={vi.fn()} onLoadMore={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText("Загружаем вакансии…")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<VacancyList vacancies={[]} selectedId={null} loading={false} loadingMore={false} hasMore={false} error={null} onSelect={vi.fn()} onLoadMore={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText("Вакансии не найдены")).toBeInTheDocument();
  });

  it("shows error with retry when empty", () => {
    render(<VacancyList vacancies={[]} selectedId={null} loading={false} loadingMore={false} hasMore={false} error="fail" onSelect={vi.fn()} onLoadMore={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText("fail")).toBeInTheDocument();
    expect(screen.getByText("Повторить")).toBeInTheDocument();
  });

  it("renders vacancy cards", () => {
    render(<VacancyList vacancies={[baseVacancy]} selectedId={null} loading={false} loadingMore={false} hasMore={false} error={null} onSelect={vi.fn()} onLoadMore={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText("Python Developer")).toBeInTheDocument();
  });
});

describe("VacancyDetailPanel", () => {
  it("shows hint when no vacancy selected", () => {
    render(<VacancyDetailPanel vacancy={null} loading={false} selectedId={null} />);
    expect(screen.getByText("Выберите вакансию из списка для просмотра деталей")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<VacancyDetailPanel vacancy={null} loading={true} selectedId="1" />);
    expect(screen.getByText("Загружаем детали…")).toBeInTheDocument();
  });

  it("renders vacancy detail", () => {
    const detail = {
      ...baseVacancy,
      description: "<p>Описание вакансии</p>",
      key_skills: [{ name: "Python" }, { name: "FastAPI" }],
      work_format: [{ id: "remote", name: "Удалённо" }],
      schedule: { id: "fullDay", name: "Полный день" },
      address: { raw: "Москва, ул. Ленина" },
    };
    render(<VacancyDetailPanel vacancy={detail as VacancyDetail} loading={false} selectedId="1" />);
    expect(screen.getByText("Python Developer")).toBeInTheDocument();
    expect(screen.getByText("Яндекс")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
    expect(screen.getByText("Удалённо")).toBeInTheDocument();
    expect(screen.getByText(/Полный день/)).toBeInTheDocument();
    expect(screen.getByText(/ул\. Ленина/)).toBeInTheDocument();
    expect(screen.getByText("Открыть на HeadHunter")).toBeInTheDocument();
  });
});
