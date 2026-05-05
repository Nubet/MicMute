export const MICROPHONE_IPC_CHANNELS = {
  getMuteState: 'microphone:getMuteState',
  setMuteState: 'microphone:setMuteState',
  toggleMuteState: 'microphone:toggleMuteState',
  muteStateChanged: 'microphone:muteStateChanged',
  getToggleShortcut: 'microphone:getToggleShortcut',
  setToggleShortcut: 'microphone:setToggleShortcut',
  getStartupSettings: 'microphone:getStartupSettings',
  setStartupOpenAtLogin: 'microphone:setStartupOpenAtLogin',
  getNotificationSettings: 'microphone:getNotificationSettings',
  updateNotificationSettings: 'microphone:updateNotificationSettings',
} as const;

export type StartupSettings = {
  supported: boolean;
  openAtLogin: boolean;
};

export type NotificationSettings = {
  showTrayNotificationOnMuteChange: boolean;
  playSoundOnMuteToggle: boolean;
};

export interface SystemMicrophoneApi {
  getMicrophoneMuteState(): Promise<boolean>;
  setMicrophoneMuteState(muted: boolean): Promise<boolean>;
  toggleMicrophoneMuteState(): Promise<boolean>;
  onMicrophoneMuteStateChanged(listener: (muted: boolean) => void): () => void;
  getMicrophoneToggleShortcut(): Promise<string | null>;
  setMicrophoneToggleShortcut(accelerator: string | null): Promise<string | null>;
  getStartupSettings(): Promise<StartupSettings>;
  setStartupOpenAtLogin(enabled: boolean): Promise<StartupSettings>;
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(patch: Partial<NotificationSettings>): Promise<NotificationSettings>;
}
