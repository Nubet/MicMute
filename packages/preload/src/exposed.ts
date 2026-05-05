import {contextBridge} from 'electron';
import {
  getMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  setMicrophoneMuteState,
  setMicrophoneToggleShortcut,
} from './index.js';
import type {SystemMicrophoneApi} from '@app/shared';

const electronApi: SystemMicrophoneApi = {
  getMicrophoneMuteState,
  setMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
};

contextBridge.exposeInMainWorld('electronApi', electronApi);

// Re-export for tests
export * from './index.js';
