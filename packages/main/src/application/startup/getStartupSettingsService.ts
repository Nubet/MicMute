import {StartupSettingsService} from './StartupSettingsService.js';

let instance: StartupSettingsService | null = null;

export function getStartupSettingsService(): StartupSettingsService {
  if (instance) {
    return instance;
  }

  instance = new StartupSettingsService();
  return instance;
}
