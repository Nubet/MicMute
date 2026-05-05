import type {SystemMicrophoneMuteService} from './SystemMicrophoneMuteService.js';

type MuteStateListener = (muted: boolean) => void;

export class MicrophoneMuteStateCoordinator {
  readonly #service: SystemMicrophoneMuteService;
  readonly #listeners = new Set<MuteStateListener>();
  #lastKnownState: boolean | null = null;
  #pollInterval: NodeJS.Timeout | null = null;
  #isSyncInProgress = false;

  constructor(service: SystemMicrophoneMuteService) {
    this.#service = service;
  }

  async initialize(): Promise<void> {
    await this.refreshState();

    if (this.#pollInterval) {
      return;
    }

    this.#pollInterval = setInterval(() => {
      void this.refreshState();
    }, 1500);
  }

  dispose(): void {
    if (!this.#pollInterval) {
      return;
    }

    clearInterval(this.#pollInterval);
    this.#pollInterval = null;
  }

  subscribe(listener: MuteStateListener): () => void {
    this.#listeners.add(listener);

    if (this.#lastKnownState !== null) {
      listener(this.#lastKnownState);
    }

    return () => {
      this.#listeners.delete(listener);
    };
  }

  async getState(): Promise<boolean> {
    return this.refreshState();
  }

  async setState(muted: boolean): Promise<boolean> {
    const next = await this.#service.setMuteState(muted);
    this.#syncState(next);
    return next;
  }

  async toggleState(): Promise<boolean> {
    const current = await this.getState();
    return this.setState(!current);
  }

  async refreshState(): Promise<boolean> {
    if (this.#isSyncInProgress && this.#lastKnownState !== null) {
      return this.#lastKnownState;
    }

    this.#isSyncInProgress = true;

    try {
      const current = await this.#service.getMuteState();
      this.#syncState(current);
      return current;
    } finally {
      this.#isSyncInProgress = false;
    }
  }

  #syncState(nextState: boolean): void {
    if (this.#lastKnownState === nextState) {
      return;
    }

    this.#lastKnownState = nextState;
    this.#emit(nextState);
  }

  #emit(muted: boolean): void {
    for (const listener of this.#listeners) {
      listener(muted);
    }
  }
}
