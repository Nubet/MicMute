export const MICROPHONE_IPC_CHANNELS = {
  getMuteState: 'microphone:getMuteState',
  setMuteState: 'microphone:setMuteState',
} as const;

export interface SystemMicrophoneApi {
  getMicrophoneMuteState(): Promise<boolean>;
  setMicrophoneMuteState(muted: boolean): Promise<boolean>;
}
