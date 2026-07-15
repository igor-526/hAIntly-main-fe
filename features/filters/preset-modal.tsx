"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

type PresetModalProps = {
  open: boolean;
  initialName?: string;
  saving: boolean;
  onSave: (name: string) => Promise<boolean>;
  onClose: () => void;
};

export function PresetModal({ open, initialName = "", saving, onSave, onClose }: PresetModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, initialName]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const ok = await onSave(name.trim());
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onClose={(_, reason) => { if (reason !== "backdropClick" || !saving) onClose(); }} disableEscapeKeyDown={saving} aria-labelledby="preset-modal-title">
      <DialogTitle id="preset-modal-title">{initialName ? "Переименовать пресет" : "Создать пресет"}</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={inputRef}
          label="Название пресета"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); }}
          fullWidth
          margin="dense"
          disabled={saving}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose}>Отмена</Button>
        <Button variant="contained" disabled={saving || !name.trim()} onClick={() => void handleSave()}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
