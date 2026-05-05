import {contextBridge} from 'electron';
import {
  getNotificationSettings,
  getStartupSettings,
  getMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  onMicrophoneMuteStateChanged,
  setStartupOpenAtLogin,
  updateNotificationSettings,
  setMicrophoneMuteState,
  setMicrophoneToggleShortcut,
  toggleMicrophoneMuteState,
} from './index.js';
import type {SystemMicrophoneApi} from '@app/shared';

const electronApi: SystemMicrophoneApi = {
  getMicrophoneMuteState,
  setMicrophoneMuteState,
  toggleMicrophoneMuteState,
  onMicrophoneMuteStateChanged,
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
  getStartupSettings,
  setStartupOpenAtLogin,
  getNotificationSettings,
  updateNotificationSettings,
};

contextBridge.exposeInMainWorld('electronApi', electronApi);

// Re-export for tests
export * from './index.js';
