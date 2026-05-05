import {MicrophoneToggleShortcutService} from './MicrophoneToggleShortcutService.js';

let instance: MicrophoneToggleShortcutService | null = null;

export function getMicrophoneToggleShortcutService(): MicrophoneToggleShortcutService {
  if (instance) {
    return instance;
  }

  instance = new MicrophoneToggleShortcutService();
  return instance;
}
