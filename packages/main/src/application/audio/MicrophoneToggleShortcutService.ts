import {globalShortcut} from 'electron';
import {getMicrophoneMuteStateCoordinator} from './getMicrophoneMuteStateCoordinator.js';
import {AppSettingsStore} from '../settings/AppSettingsStore.js';

export class MicrophoneToggleShortcutService {
  #activeShortcut: string | null = null;
  readonly #settingsStore = new AppSettingsStore();

  async initialize(): Promise<void> {
    const persistedShortcut = this.#settingsStore.read().microphoneToggleShortcut;
    await this.setShortcut(persistedShortcut);
  }

  getShortcut(): string | null {
    return this.#activeShortcut;
  }

  async setShortcut(accelerator: string | null): Promise<string | null> {
    if (this.#activeShortcut) {
      globalShortcut.unregister(this.#activeShortcut);
    }

    if (!accelerator) {
      this.#activeShortcut = null;
      const settings = this.#settingsStore.read();
      this.#settingsStore.write({...settings, microphoneToggleShortcut: null});
      return null;
    }

    const registered = globalShortcut.register(accelerator, () => {
      void this.#toggleSystemMute();
    });

    if (!registered) {
      throw new Error('Shortcut could not be registered. It may already be used by another app.');
    }

    this.#activeShortcut = accelerator;
    const settings = this.#settingsStore.read();
    this.#settingsStore.write({...settings, microphoneToggleShortcut: accelerator});
    return this.#activeShortcut;
  }

  async #toggleSystemMute(): Promise<void> {
    await getMicrophoneMuteStateCoordinator().toggleState();
  }
}
