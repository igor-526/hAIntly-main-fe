"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type DeleteConfirmModalProps = {
  open: boolean;
  presetName: string;
  saving: boolean;
  onConfirm: () => Promise<boolean>;
  onClose: () => void;
};

export function DeleteConfirmModal({ open, presetName, saving, onConfirm, onClose }: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    const ok = await onConfirm();
    if (ok) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick" || !saving) onClose();
      }}
      disableEscapeKeyDown={saving}
      aria-labelledby="delete-preset-title"
    >
      <DialogTitle id="delete-preset-title">Удалить пресет?</DialogTitle>
      <DialogContent>
        <DialogContentText>Пресет «{presetName}» будет удалён. Это действие нельзя отменить.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose}>
          Отмена
        </Button>
        <Button color="error" variant="contained" disabled={saving} onClick={() => void handleConfirm()}>
          {saving ? "Удаляем…" : "Удалить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
