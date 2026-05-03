import type {MicrophoneMutePort} from '../../domain/audio/MicrophoneMutePort.js';

export class SystemMicrophoneMuteService {
  readonly #port: MicrophoneMutePort;

  constructor(port: MicrophoneMutePort) {
    this.#port = port;
  }

  async getMuteState(): Promise<boolean> {
    return this.#port.getMuteState();
  }

  async setMuteState(muted: boolean): Promise<boolean> {
    return this.#port.setMuteState(muted);
  }
}
