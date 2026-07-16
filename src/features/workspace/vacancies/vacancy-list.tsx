"use client";

import { useEffect, useRef } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { VacancyCard } from "./vacancy-card";
import type { VacancyListItem } from "./types";

type VacancyListProps = {
  vacancies: VacancyListItem[];
  selectedId: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

export function VacancyList({ vacancies, selectedId, loading, loadingMore, hasMore, error, onSelect, onLoadMore, onRetry }: VacancyListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore]);

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
          Загружаем вакансии…
        </Typography>
      </Stack>
    );
  }

  if (error && vacancies.length === 0) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 200,
        }}
      >
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      </Stack>
    );
  }

  if (vacancies.length === 0) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 200,
        }}
      >
        <Typography color="text.secondary">Вакансии не найдены</Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      {vacancies.map((v) => (
        <VacancyCard key={v.id} vacancy={v} selected={v.id === selectedId} onClick={() => onSelect(v.id)} />
      ))}
      {hasMore && (
        <Box ref={sentinelRef} sx={{ py: 1, textAlign: "center" }}>
          {loadingMore && <CircularProgress size={24} />}
        </Box>
      )}
      {error && vacancies.length > 0 && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}
