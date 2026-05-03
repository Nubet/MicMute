import {contextBridge} from 'electron';
import {
  getMicrophoneMuteState,
  setMicrophoneMuteState,
} from './index.js';
import type {SystemMicrophoneApi} from '@app/shared';

const electronApi: SystemMicrophoneApi = {
  getMicrophoneMuteState,
  setMicrophoneMuteState,
};

contextBridge.exposeInMainWorld('electronApi', electronApi);

// Re-export for tests
export * from './index.js';
