"use client";

import { useRef, useState } from "react";
import { Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { FilterPresetListItem } from "./types";

type PresetSelectorProps = {
  presets: FilterPresetListItem[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string | null) => void;
  onEdit: (preset: FilterPresetListItem) => void;
  onDelete: (preset: FilterPresetListItem) => void;
  onSearch: (q: string) => void;
};

export function PresetSelector({ presets, selectedId, loading, onSelect, onEdit, onDelete, onSearch }: PresetSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedName = presets.find((p) => p.id === selectedId)?.name ?? "Пресеты";

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 300);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearch("");
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outlined"
        size="small"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-expanded={!!anchorEl}
        aria-haspopup="listbox"
        sx={{ textTransform: "none", justifyContent: "space-between", minWidth: 200 }}
      >
        {selectedName}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 320, maxHeight: 400 } } }}
      >
        <Box sx={{ px: 1, pb: 1 }}>
          <TextField
            size="small"
            placeholder="Поиск пресетов…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth
            autoFocus
          />
        </Box>
        <MenuItem
          onClick={() => { onSelect(null); handleClose(); }}
          selected={!selectedId}
        >
          <ListItemText primary="Без пресета" />
        </MenuItem>
        <Divider />
        {loading && <MenuItem disabled><Typography variant="body2" color="text.secondary">Загрузка…</Typography></MenuItem>}
        {!loading && presets.length === 0 && <MenuItem disabled><Typography variant="body2" color="text.secondary">Пресетов нет</Typography></MenuItem>}
        {presets.map((preset) => (
          <ListItemButton
            key={preset.id}
            selected={preset.id === selectedId}
            onClick={() => { onSelect(preset.id); handleClose(); }}
            sx={{ pr: 1 }}
          >
            <ListItemText primary={preset.name} sx={{ mr: 1 }} />
            <Stack direction="row" spacing={0} sx={{ flexShrink: 0 }}>
              <Tooltip title="Переименовать">
                <IconButton
                  size="small"
                  aria-label={`Переименовать пресет ${preset.name}`}
                  onClick={(e) => { e.stopPropagation(); onEdit(preset); handleClose(); }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Удалить пресет ${preset.name}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(preset); handleClose(); }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemButton>
        ))}
      </Menu>
    </>
  );
}
