"use client";

import { useCallback, useState } from "react";
import { filterService } from "./service";
import { EMPTY_FORM, formDataToPayload, presetToFormData, type FilterPresetFormData, type FilterPresetListItem } from "./types";

type State = {
  presets: FilterPresetListItem[];
  selectedPresetId: string | null;
  form: FilterPresetFormData;
  loading: boolean;
  saving: boolean;
  error?: string;
  toast?: string;
};

export function useFilters() {
  const [state, setState] = useState<State>({
    presets: [],
    selectedPresetId: null,
    form: { ...EMPTY_FORM },
    loading: false,
    saving: false,
  });

  const loadPresets = useCallback(async (q?: string) => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await filterService.list(q);
      setState((s) => ({ ...s, presets: data.items, loading: false }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error.message : "Ошибка загрузки пресетов" }));
    }
  }, []);

  const selectPreset = useCallback(async (id: string | null) => {
    if (!id) {
      setState((s) => ({ ...s, selectedPresetId: null, form: { ...EMPTY_FORM } }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const preset = await filterService.get(id);
      setState((s) => ({ ...s, selectedPresetId: id, form: presetToFormData(preset), loading: false }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: error instanceof Error ? error.message : "Ошибка загрузки пресета" }));
    }
  }, []);

  const updateForm = useCallback((patch: Partial<FilterPresetFormData>) => {
    setState((s) => ({ ...s, form: { ...s.form, ...patch } }));
  }, []);

  const resetForm = useCallback(() => {
    setState((s) => ({ ...s, selectedPresetId: null, form: { ...EMPTY_FORM } }));
  }, []);

  const savePreset = useCallback(async (name?: string) => {
    const formName = name ?? state.form.name;
    if (!formName.trim()) return false;
    setState((s) => ({ ...s, saving: true, error: undefined }));
    try {
      const payload = formDataToPayload({ ...state.form, name: formName });
      if (state.selectedPresetId) {
        await filterService.update(state.selectedPresetId, payload);
        setState((s) => ({ ...s, saving: false, toast: `Пресет «${formName}» успешно сохранён` }));
      } else {
        const created = await filterService.create(payload);
        setState((s) => ({ ...s, selectedPresetId: created.id, saving: false, toast: `Пресет «${formName}» успешно сохранён` }));
      }
      await loadPresets();
      return true;
    } catch (error) {
      setState((s) => ({ ...s, saving: false, error: error instanceof Error ? error.message : "Ошибка сохранения пресета" }));
      return false;
    }
  }, [state.form, state.selectedPresetId, loadPresets]);

  const renamePreset = useCallback(async (id: string, name: string) => {
    setState((s) => ({ ...s, saving: true, error: undefined }));
    try {
      await filterService.update(id, { name });
      setState((s) => ({ ...s, saving: false, toast: `Пресет переименован в «${name}»` }));
      await loadPresets();
      return true;
    } catch (error) {
      setState((s) => ({ ...s, saving: false, error: error instanceof Error ? error.message : "Ошибка переименования пресета" }));
      return false;
    }
  }, [loadPresets]);

  const deletePreset = useCallback(async (id: string) => {
    setState((s) => ({ ...s, saving: true, error: undefined }));
    try {
      await filterService.remove(id);
      setState((s) => ({
        ...s,
        saving: false,
        selectedPresetId: s.selectedPresetId === id ? null : s.selectedPresetId,
        form: s.selectedPresetId === id ? { ...EMPTY_FORM } : s.form,
        toast: "Пресет удалён",
      }));
      await loadPresets();
      return true;
    } catch (error) {
      setState((s) => ({ ...s, saving: false, error: error instanceof Error ? error.message : "Ошибка удаления пресета" }));
      return false;
    }
  }, [loadPresets]);

  const clearToast = useCallback(() => {
    setState((s) => ({ ...s, toast: undefined }));
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: undefined }));
  }, []);

  return {
    ...state,
    loadPresets,
    selectPreset,
    updateForm,
    resetForm,
    savePreset,
    renamePreset,
    deletePreset,
    clearToast,
    clearError,
  };
}
