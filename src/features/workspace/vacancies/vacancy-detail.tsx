"use client";

import { Box, Chip, CircularProgress, Divider, Link, Stack, Typography } from "@mui/material";
import type { VacancyDetail, VacancySalary } from "./types";

function formatSalary(salary: VacancySalary | null): string | null {
  if (!salary) return null;
  const { from, to, currency } = salary;
  const parts: string[] = [];
  if (from != null) parts.push(`от ${from.toLocaleString("ru-RU")}`);
  if (to != null) parts.push(`до ${to.toLocaleString("ru-RU")}`);
  if (parts.length === 0) return null;
  if (currency) parts.push(currency);
  return parts.join(" ");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

type VacancyDetailPanelProps = {
  vacancy: VacancyDetail | null;
  loading: boolean;
  selectedId: string | null;
};

export function VacancyDetailPanel({ vacancy, loading, selectedId }: VacancyDetailPanelProps) {
  if (loading) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 200,
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Загружаем детали…
        </Typography>
      </Stack>
    );
  }

  if (!selectedId) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 200,
        }}
      >
        <Typography color="text.secondary">Выберите вакансию из списка для просмотра деталей</Typography>
      </Stack>
    );
  }

  if (!vacancy) return null;

  const salary = formatSalary(vacancy.salary_range ?? vacancy.salary);

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {vacancy.name}
      </Typography>
      {vacancy.employer && (
        <Typography variant="subtitle1" color="text.secondary">
          {vacancy.employer.name}
        </Typography>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
        {salary && <Chip label={salary} size="small" color="success" variant="outlined" />}
        <Chip label={vacancy.area.name} size="small" variant="outlined" />
        {vacancy.experience && <Chip label={vacancy.experience.name} size="small" variant="outlined" />}
        {vacancy.employment_form && <Chip label={vacancy.employment_form.name} size="small" variant="outlined" />}
        {vacancy.work_format?.map((wf) => (
          <Chip key={wf.id} label={wf.name} size="small" variant="outlined" />
        ))}
        {vacancy.schedule && <Chip label={vacancy.schedule.name} size="small" variant="outlined" />}
      </Stack>

      {vacancy.key_skills.length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
          {vacancy.key_skills.map((skill) => (
            <Chip key={skill.name} label={skill.name} size="small" />
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />

      {vacancy.description && (
        <Box
          sx={{
            "& p": { mb: 1 },
            "& ul, & ol": { pl: 3, mb: 1 },
            "& li": { mb: 0.5 },
            "& strong": { fontWeight: 600 },
          }}
          dangerouslySetInnerHTML={{ __html: vacancy.description }}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Stack spacing={0.5}>
        {vacancy.address?.raw && (
          <Typography variant="body2" color="text.secondary">
            Адрес: {vacancy.address.raw}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Опубликовано: {formatDate(vacancy.published_at)}
        </Typography>
        <Link href={vacancy.alternate_url} target="_blank" rel="noopener noreferrer" variant="body2">
          Открыть на HeadHunter
        </Link>
      </Stack>
    </Box>
  );
}
