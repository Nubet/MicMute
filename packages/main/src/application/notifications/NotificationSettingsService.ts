import type {NotificationSettings} from '../settings/AppSettingsStore.js';
import {AppSettingsStore} from '../settings/AppSettingsStore.js';

export class NotificationSettingsService {
  readonly #settingsStore = new AppSettingsStore();

  getSettings(): NotificationSettings {
    return this.#settingsStore.read().notifications;
  }

  updateSettings(patch: Partial<NotificationSettings>): NotificationSettings {
    const current = this.#settingsStore.read();
    const next = {
      ...current,
      notifications: {
        ...current.notifications,
        ...patch,
      },
    };

    this.#settingsStore.write(next);
    return next.notifications;
  }
}
