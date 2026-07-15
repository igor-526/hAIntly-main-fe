"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Divider, Drawer, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useFilters } from "./use-filters";
import { PresetSelector } from "./preset-selector";
import { FilterForm } from "./filter-form";
import { PresetModal } from "./preset-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import type { FilterPresetFormData, FilterPresetListItem } from "./types";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  onApply?: (form: FilterPresetFormData, presetId: string | null) => void;
};

export function FilterDrawer({ open, onClose, onApply }: FilterDrawerProps) {
  const filters = useFilters();
  const presetsLoaded = useRef(false);
  const [presetModal, setPresetModal] = useState<{ open: boolean; initialName: string; mode: "create" | "rename"; targetId?: string }>({ open: false, initialName: "", mode: "create" });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; preset: FilterPresetListItem | null }>({ open: false, preset: null });

  useEffect(() => {
    if (open && !presetsLoaded.current) {
      presetsLoaded.current = true;
      void filters.loadPresets();
    }
  }, [open, filters.loadPresets]);

  const handleSave = async () => {
    if (filters.selectedPresetId) {
      await filters.savePreset();
    } else {
      setPresetModal({ open: true, initialName: "", mode: "create" });
    }
  };

  const handlePresetModalSave = async (name: string) => {
    if (presetModal.mode === "rename" && presetModal.targetId) {
      return filters.renamePreset(presetModal.targetId, name);
    }
    return filters.savePreset(name);
  };

  const handleEditPreset = (preset: FilterPresetListItem) => {
    setPresetModal({ open: true, initialName: preset.name, mode: "rename", targetId: preset.id });
  };

  const handleDeletePreset = (preset: FilterPresetListItem) => {
    setDeleteModal({ open: true, preset });
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 }, display: "flex", flexDirection: "column" } } }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Фильтры</Typography>
            <IconButton aria-label="Закрыть фильтры" onClick={onClose}>×</IconButton>
          </Stack>
          <PresetSelector
            presets={filters.presets}
            selectedId={filters.selectedPresetId}
            loading={filters.loading}
            onSelect={filters.selectPreset}
            onEdit={handleEditPreset}
            onDelete={handleDeletePreset}
            onSearch={(q) => filters.loadPresets(q)}
          />
        </Box>

        {filters.error && <Alert severity="error" sx={{ mx: 2, mb: 1 }} onClose={filters.clearError}>{filters.error}</Alert>}

        <Divider sx={{ mx: 2 }} />

        {/* Form */}
        <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 1 }}>
          <FilterForm form={filters.form} onChange={filters.updateForm} disabled={filters.saving} />
        </Box>

        <Divider />

        {/* Buttons */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Сбросить фильтры">
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={filters.resetForm}
                  disabled={filters.saving}
                  fullWidth
                >
                  Сброс
                </Button>
              </Tooltip>
              <Tooltip title="Сохранить фильтры">
                <Button
                  color="secondary"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => void handleSave()}
                  disabled={filters.saving}
                  fullWidth
                >
                  Сохранить
                </Button>
              </Tooltip>
            </Stack>
            <Tooltip title="Применить фильтры">
              <Button
                color="primary"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={filters.saving}
                fullWidth
                onClick={() => onApply?.(filters.form, filters.selectedPresetId)}
              >
                Применить
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Drawer>

      <PresetModal
        open={presetModal.open}
        initialName={presetModal.initialName}
        saving={filters.saving}
        onSave={handlePresetModalSave}
        onClose={() => setPresetModal({ open: false, initialName: "", mode: "create" })}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        presetName={deleteModal.preset?.name ?? ""}
        saving={filters.saving}
        onConfirm={() => filters.deletePreset(deleteModal.preset!.id)}
        onClose={() => setDeleteModal({ open: false, preset: null })}
      />

      <Snackbar open={!!filters.toast} autoHideDuration={4000} onClose={filters.clearToast}>
        <Alert severity="success" onClose={filters.clearToast}>{filters.toast}</Alert>
      </Snackbar>
    </>
  );
}
