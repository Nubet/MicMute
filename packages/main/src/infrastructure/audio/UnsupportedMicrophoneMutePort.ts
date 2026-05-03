import type {MicrophoneMutePort} from '../../domain/audio/MicrophoneMutePort.js';

export class UnsupportedMicrophoneMutePort implements MicrophoneMutePort {
  async getMuteState(): Promise<boolean> {
    throw new Error('System microphone mute is not supported on this platform yet.');
  }

  async setMuteState(): Promise<boolean> {
    throw new Error('System microphone mute is not supported on this platform yet.');
  }
}
