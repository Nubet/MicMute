import {app} from 'electron';
import type {StartupSettings} from '@app/shared';

export class StartupSettingsService {
  getSettings(): StartupSettings {
    if (!this.#isSupportedPlatform()) {
      return {
        supported: false,
        openAtLogin: false,
      };
    }

    const loginSettings = app.getLoginItemSettings();

    return {
      supported: true,
      openAtLogin: loginSettings.openAtLogin,
    };
  }

  setOpenAtLogin(enabled: boolean): StartupSettings {
    if (!this.#isSupportedPlatform()) {
      return {
        supported: false,
        openAtLogin: false,
      };
    }

    app.setLoginItemSettings({
      openAtLogin: enabled,
    });

    return this.getSettings();
  }

  #isSupportedPlatform(): boolean {
    return process.platform === 'win32' || process.platform === 'darwin';
  }
}
