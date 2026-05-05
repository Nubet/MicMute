import {useCallback, useEffect, useState} from 'react';
import {
  getStartupSettings,
  setStartupOpenAtLogin,
} from '../../infrastructure/electron/systemMicrophoneApi';

type StartupState = {
  supported: boolean;
  openAtLogin: boolean;
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

export function useStartupSettings() {
  const [settings, setSettings] = useState<StartupState>({supported: false, openAtLogin: false});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await getStartupSettings();
    setSettings(next);
    return next;
  }, []);

  const toggleOpenAtLogin = useCallback(async (enabled: boolean) => {
    setIsSaving(true);

    try {
      const next = await setStartupOpenAtLogin(enabled);
      setSettings(next);
      setError(null);
      return next;
    } catch (currentError) {
      setError(`Failed to update startup setting: ${toErrorMessage(currentError)}`);
      throw currentError;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
        setError(null);
      } catch (currentError) {
        setError(`Failed to load startup settings: ${toErrorMessage(currentError)}`);
      }
    };

    void load();
  }, [refresh]);

  return {
    settings,
    isSaving,
    error,
    toggleOpenAtLogin,
  };
}
