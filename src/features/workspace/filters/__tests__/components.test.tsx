"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresetModal } from "../preset-modal";
import { DeleteConfirmModal } from "../delete-confirm-modal";

describe("PresetModal", () => {
  it("renders create mode", () => {
    render(<PresetModal open initialName="" saving={false} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Создать пресет")).toBeInTheDocument();
    expect(screen.getByLabelText("Название пресета")).toBeInTheDocument();
  });

  it("renders rename mode with initial name", () => {
    render(<PresetModal open initialName="Old Name" saving={false} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Переименовать пресет")).toBeInTheDocument();
    expect(screen.getByLabelText("Название пресета")).toHaveValue("Old Name");
  });

  it("calls onSave with name on save click", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<PresetModal open initialName="" saving={false} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Название пресета"), {
      target: { value: "My Preset" },
    });
    fireEvent.click(screen.getByText("Сохранить"));
    expect(onSave).toHaveBeenCalledWith("My Preset");
  });

  it("calls onClose on cancel", () => {
    const onClose = vi.fn();
    render(<PresetModal open initialName="" saving={false} onSave={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("Отмена"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables save when name is empty", () => {
    render(<PresetModal open initialName="" saving={false} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Сохранить")).toBeDisabled();
  });
});

describe("DeleteConfirmModal", () => {
  it("renders with preset name", () => {
    render(<DeleteConfirmModal open presetName="My Preset" saving={false} onConfirm={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Удалить пресет?")).toBeInTheDocument();
    expect(screen.getByText(/My Preset/)).toBeInTheDocument();
  });

  it("calls onConfirm on delete click", async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    render(<DeleteConfirmModal open presetName="Test" saving={false} onConfirm={onConfirm} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Удалить"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onClose on cancel", () => {
    const onClose = vi.fn();
    render(<DeleteConfirmModal open presetName="Test" saving={false} onConfirm={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("Отмена"));
    expect(onClose).toHaveBeenCalled();
  });
});
