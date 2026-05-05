import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {app, globalShortcut} from 'electron';
import {getSystemMicrophoneMuteService} from './getSystemMicrophoneMuteService.js';

type PersistedSettings = {
  microphoneToggleShortcut: string | null;
};

export class MicrophoneToggleShortcutService {
  #activeShortcut: string | null = null;

  async initialize(): Promise<void> {
    const persistedShortcut = this.#readSettings().microphoneToggleShortcut;
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
      this.#writeSettings({microphoneToggleShortcut: null});
      return null;
    }

    const registered = globalShortcut.register(accelerator, () => {
      void this.#toggleSystemMute();
    });

    if (!registered) {
      throw new Error('Shortcut could not be registered. It may already be used by another app.');
    }

    this.#activeShortcut = accelerator;
    this.#writeSettings({microphoneToggleShortcut: accelerator});
    return this.#activeShortcut;
  }

  #settingsPath(): string {
    return join(app.getPath('userData'), 'settings.json');
  }

  #readSettings(): PersistedSettings {
    const path = this.#settingsPath();

    try {
      const raw = readFileSync(path, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
      return {
        microphoneToggleShortcut: parsed.microphoneToggleShortcut ?? null,
      };
    } catch {
      return {microphoneToggleShortcut: null};
    }
  }

  #writeSettings(settings: PersistedSettings): void {
    const path = this.#settingsPath();
    mkdirSync(dirname(path), {recursive: true});
    writeFileSync(path, JSON.stringify(settings, null, 2), 'utf-8');
  }

  async #toggleSystemMute(): Promise<void> {
    const service = getSystemMicrophoneMuteService();
    const current = await service.getMuteState();
    await service.setMuteState(!current);
  }
}
