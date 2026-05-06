import {globalShortcut} from 'electron';
import {getMicrophoneMuteStateCoordinator} from './getMicrophoneMuteStateCoordinator.js';
import {AppSettingsStore} from '../settings/AppSettingsStore.js';

export class MicrophoneToggleShortcutService {
  #activeShortcut: string | null = null;
  readonly #settingsStore = new AppSettingsStore();

  async initialize(): Promise<void> {
    const persistedShortcut = this.#settingsStore.read().microphoneToggleShortcut;
    if (!persistedShortcut) {
      return;
    }

    try {
      await this.setShortcut(persistedShortcut);
    } catch (error) {
      console.warn('[MicrophoneToggleShortcutService] Failed to initialize shortcut:', error);
    }
  }

  getShortcut(): string | null {
    return this.#activeShortcut;
  }

  async setShortcut(accelerator: string | null): Promise<string | null> {
    const previousShortcut = this.#activeShortcut;

    if (accelerator === previousShortcut) {
      return previousShortcut;
    }

    if (!accelerator) {
      if (previousShortcut) {
        globalShortcut.unregister(previousShortcut);
      }

      this.#activeShortcut = null;
      const settings = this.#settingsStore.read();
      this.#settingsStore.write({...settings, microphoneToggleShortcut: null});
      return null;
    }

    if (isGnomeWaylandSession()) {
      throw new Error('Global shortcuts are not supported on GNOME Wayland. Use an X11 session or a desktop environment with GlobalShortcuts portal support.');
    }

    const registered = globalShortcut.register(accelerator, () => {
      void this.#toggleSystemMute();
    });

    if (!registered) {
      const isWayland = process.platform === 'linux' && Boolean(process.env.WAYLAND_DISPLAY);
      const details = isWayland
        ? ' On Wayland, global shortcuts may require desktop portal support.'
        : '';

      throw new Error(`Shortcut could not be registered. It may already be used by another app or unavailable on this desktop environment.${details}`);
    }

    if (previousShortcut) {
      globalShortcut.unregister(previousShortcut);
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

function isGnomeWaylandSession(): boolean {
  if (process.platform !== 'linux') {
    return false;
  }

  const isWayland = Boolean(process.env.WAYLAND_DISPLAY);
  const desktop = (process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || '').toLowerCase();
  const isGnome = desktop.includes('gnome');

  return isWayland && isGnome;
}
