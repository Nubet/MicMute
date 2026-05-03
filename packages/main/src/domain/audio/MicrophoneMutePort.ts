export interface MicrophoneMutePort {
  getMuteState(): Promise<boolean>;
  setMuteState(muted: boolean): Promise<boolean>;
}
