export const MICROPHONE_IPC_CHANNELS = {
  getMuteState: 'microphone:getMuteState',
  setMuteState: 'microphone:setMuteState',
  getToggleShortcut: 'microphone:getToggleShortcut',
  setToggleShortcut: 'microphone:setToggleShortcut',
} as const;

export interface SystemMicrophoneApi {
  getMicrophoneMuteState(): Promise<boolean>;
  setMicrophoneMuteState(muted: boolean): Promise<boolean>;
  getMicrophoneToggleShortcut(): Promise<string | null>;
  setMicrophoneToggleShortcut(accelerator: string | null): Promise<string | null>;
}
