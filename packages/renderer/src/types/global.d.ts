import type {SystemMicrophoneApi} from '@app/shared';

declare global {
  interface Window {
    electronApi: SystemMicrophoneApi;
  }
}

export {};
