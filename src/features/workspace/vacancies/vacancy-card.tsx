"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import type { VacancyListItem, VacancySalary } from "./types";

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

function stripHighlight(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/<\/?highlighttext>/g, "");
}

type VacancyCardProps = {
  vacancy: VacancyListItem;
  selected: boolean;
  onClick: () => void;
};

export function VacancyCard({ vacancy, selected, onClick }: VacancyCardProps) {
  const salary = formatSalary(vacancy.salary_range ?? vacancy.salary);
  const snippet = stripHighlight(vacancy.snippet.responsibility ?? vacancy.snippet.requirement);
  const employer = vacancy.employer?.name;

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: 1,
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 1,
        p: 1.5,
        mb: 1,
        cursor: "pointer",
        bgcolor: selected ? "action.selected" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
        transition: "background-color 150ms, border-color 150ms",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {vacancy.name}
      </Typography>
      {employer && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {employer}
        </Typography>
      )}
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
        {salary && <Chip label={salary} size="small" color="success" variant="outlined" />}
        <Chip label={vacancy.area.name} size="small" variant="outlined" />
        {vacancy.experience && <Chip label={vacancy.experience.name} size="small" variant="outlined" />}
      </Stack>
      {snippet && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snippet}
        </Typography>
      )}
    </Box>
  );
}
