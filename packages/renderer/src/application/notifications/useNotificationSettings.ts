import {useCallback, useEffect, useState} from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../../infrastructure/electron/systemMicrophoneApi';

type NotificationSettings = {
  showTrayNotificationOnMuteChange: boolean;
  playSoundOnMuteToggle: boolean;
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    showTrayNotificationOnMuteChange: true,
    playSoundOnMuteToggle: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await getNotificationSettings();
    setSettings(next);
    return next;
  }, []);

  const patchSettings = useCallback(async (patch: Partial<NotificationSettings>) => {
    setIsSavingSettings(true);

    try {
      const next = await updateNotificationSettings(patch);
      setSettings(next);
      setSettingsError(null);
      return next;
    } catch (error) {
      setSettingsError(`Failed to update notification settings: ${toErrorMessage(error)}`);
      throw error;
    } finally {
      setIsSavingSettings(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
        setSettingsError(null);
      } catch (error) {
        setSettingsError(`Failed to load notification settings: ${toErrorMessage(error)}`);
      }
    };

    void load();
  }, [refresh]);

  return {
    settings,
    isSavingSettings,
    settingsError,
    patchSettings,
  };
}
