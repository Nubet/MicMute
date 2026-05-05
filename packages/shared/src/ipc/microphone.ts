export const MICROPHONE_IPC_CHANNELS = {
  getMuteState: 'microphone:getMuteState',
  setMuteState: 'microphone:setMuteState',
  getToggleShortcut: 'microphone:getToggleShortcut',
  setToggleShortcut: 'microphone:setToggleShortcut',
  getStartupSettings: 'microphone:getStartupSettings',
  setStartupOpenAtLogin: 'microphone:setStartupOpenAtLogin',
} as const;

export type StartupSettings = {
  supported: boolean;
  openAtLogin: boolean;
};

export interface SystemMicrophoneApi {
  getMicrophoneMuteState(): Promise<boolean>;
  setMicrophoneMuteState(muted: boolean): Promise<boolean>;
  getMicrophoneToggleShortcut(): Promise<string | null>;
  setMicrophoneToggleShortcut(accelerator: string | null): Promise<string | null>;
  getStartupSettings(): Promise<StartupSettings>;
  setStartupOpenAtLogin(enabled: boolean): Promise<StartupSettings>;
}
