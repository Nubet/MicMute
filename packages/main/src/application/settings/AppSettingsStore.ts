import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {app} from 'electron';

export type NotificationSettings = {
  showTrayNotificationOnMuteChange: boolean;
  playSoundOnMuteToggle: boolean;
};

export type PersistedAppSettings = {
  microphoneToggleShortcut: string | null;
  notifications: NotificationSettings;
};

const DEFAULT_SETTINGS: PersistedAppSettings = {
  microphoneToggleShortcut: null,
  notifications: {
    showTrayNotificationOnMuteChange: true,
    playSoundOnMuteToggle: false,
  },
};

export class AppSettingsStore {
  read(): PersistedAppSettings {
    const path = this.#settingsPath();

    try {
      const raw = readFileSync(path, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedAppSettings>;

      return {
        microphoneToggleShortcut: parsed.microphoneToggleShortcut ?? DEFAULT_SETTINGS.microphoneToggleShortcut,
        notifications: {
          showTrayNotificationOnMuteChange: parsed.notifications?.showTrayNotificationOnMuteChange ?? DEFAULT_SETTINGS.notifications.showTrayNotificationOnMuteChange,
          playSoundOnMuteToggle: parsed.notifications?.playSoundOnMuteToggle ?? DEFAULT_SETTINGS.notifications.playSoundOnMuteToggle,
        },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  write(next: PersistedAppSettings): void {
    const path = this.#settingsPath();
    mkdirSync(dirname(path), {recursive: true});
    writeFileSync(path, JSON.stringify(next, null, 2), 'utf-8');
  }

  #settingsPath(): string {
    return join(app.getPath('userData'), 'settings.json');
  }
}
