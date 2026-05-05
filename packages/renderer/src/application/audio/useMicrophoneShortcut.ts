import {useCallback, useEffect, useState} from 'react';
import {
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
} from '../../infrastructure/electron/systemMicrophoneApi';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

export function useMicrophoneShortcut() {
  const [shortcut, setShortcut] = useState<string | null>(null);
  const [isSavingShortcut, setIsSavingShortcut] = useState(false);
  const [shortcutError, setShortcutError] = useState<string | null>(null);

  const refreshShortcut = useCallback(async () => {
    const current = await getMicrophoneToggleShortcut();
    setShortcut(current);
    return current;
  }, []);

  const saveShortcut = useCallback(async (value: string | null) => {
    setIsSavingShortcut(true);

    try {
      const next = await setMicrophoneToggleShortcut(value);
      setShortcut(next);
      setShortcutError(null);
      return next;
    } catch (error) {
      setShortcutError(`Failed to save shortcut: ${toErrorMessage(error)}`);
      throw error;
    } finally {
      setIsSavingShortcut(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refreshShortcut();
        setShortcutError(null);
      } catch (error) {
        setShortcutError(`Failed to load shortcut: ${toErrorMessage(error)}`);
      }
    };

    void load();
  }, [refreshShortcut]);

  return {
    shortcut,
    isSavingShortcut,
    shortcutError,
    saveShortcut,
  };
}
