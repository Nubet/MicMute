import {contextBridge} from 'electron';
import {
  getStartupSettings,
  getMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  setStartupOpenAtLogin,
  setMicrophoneMuteState,
  setMicrophoneToggleShortcut,
} from './index.js';
import type {SystemMicrophoneApi} from '@app/shared';

const electronApi: SystemMicrophoneApi = {
  getMicrophoneMuteState,
  setMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
  getStartupSettings,
  setStartupOpenAtLogin,
};

contextBridge.exposeInMainWorld('electronApi', electronApi);

// Re-export for tests
export * from './index.js';
