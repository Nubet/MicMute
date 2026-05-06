import {useEffect, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import {
  Settings,
  Keyboard,
  Power,
  Bell,
  Mic,
  MicOff,
  ChevronDown,
} from 'lucide-react';

type Props = {
  microphones: MediaDeviceInfo[];
  selectedMicrophoneId: string;
  activeMicrophoneName: string;
  isMuted: boolean;
  isMutePending: boolean;
  shortcut: string | null;
  isSavingShortcut: boolean;
  error: string | null;
  shortcutError: string | null;
  startupSettings: {supported: boolean, openAtLogin: boolean};
  isSavingStartup: boolean;
  startupError: string | null;
  notificationSettings: {
    showTrayNotificationOnMuteChange: boolean;
    playSoundOnMuteToggle: boolean;
  };
  isSavingNotificationSettings: boolean;
  notificationSettingsError: string | null;
  onMicrophoneChange: (deviceId: string) => Promise<void>;
  onToggleMute: () => Promise<void>;
  onSaveShortcut: (shortcut: string | null) => Promise<string | null>;
  onToggleStartupOpenAtLogin: (enabled: boolean) => Promise<{supported: boolean, openAtLogin: boolean}>;
  onPatchNotificationSettings: (patch: {
    showTrayNotificationOnMuteChange?: boolean;
    playSoundOnMuteToggle?: boolean;
  }) => Promise<{
    showTrayNotificationOnMuteChange: boolean;
    playSoundOnMuteToggle: boolean;
  }>;
};

function keyToAccelerator(key: string): string {
  if (key === ' ') return 'Space';
  if (key.length === 1) return key.toUpperCase();
  const aliases: Record<string, string> = {
    ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
    Escape: 'Esc', Delete: 'Delete', Insert: 'Insert', Home: 'Home', End: 'End',
    PageUp: 'PageUp', PageDown: 'PageDown', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace',
  };
  return aliases[key] || (/^F\d{1,2}$/.test(key) ? key : key);
}

const Kbd = ({keys}: {keys: string}) => {
  const parts = keys.split('+');
  return (
    <span className="mic-panel__kbd-list">
      {parts.map((k, i) => (
        <kbd key={i} className="mic-panel__kbd">{k}</kbd>
      ))}
    </span>
  );
};

export function MicrophonePanel({
                                  microphones,
                                  selectedMicrophoneId,
                                  isMuted,
                                  isMutePending,
                                  shortcut,
                                  isSavingShortcut,
                                  error,
                                  shortcutError,
                                  startupSettings,
                                  isSavingStartup,
                                  startupError,
                                  notificationSettings,
                                  isSavingNotificationSettings,
                                  notificationSettingsError,
                                  onMicrophoneChange,
                                  onToggleMute,
                                  onSaveShortcut,
                                  onToggleStartupOpenAtLogin,
                                  onPatchNotificationSettings,
                                }: Props) {
  const [activeSection, setActiveSection] = useState<'audio' | 'shortcuts' | 'startup' | 'notifications'>('audio');
  const [isCapturingShortcut, setIsCapturingShortcut] = useState(false);
  const [draftShortcut, setDraftShortcut] = useState<string | null>(shortcut);

  useEffect(() => {
    setDraftShortcut(shortcut);
  }, [shortcut]);

  const handleShortcutCapture = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.key === 'Escape') {
      setIsCapturingShortcut(false);
      return;
    }
    const modifiers = [
      event.ctrlKey ? 'Ctrl' : null,
      event.altKey ? 'Alt' : null,
      event.shiftKey ? 'Shift' : null,
      event.metaKey ? 'Super' : null,
    ].filter(Boolean) as string[];

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return;

    const key = keyToAccelerator(event.key);
    setDraftShortcut([...modifiers, key].join('+'));
    setIsCapturingShortcut(false);
  };

  const statusText = isMutePending ? 'Updating...' : isMuted ? 'Muted' : 'Live';
  const statusClass = isMutePending ? 'pending' : isMuted ? 'muted' : 'live';

  return (
    <div className="mic-panel">
      <header className="mic-panel__header">
        <h1>MicMute</h1>
        <div className="mic-panel__status">
          <div className={`mic-panel__status-dot mic-panel__status-dot--${statusClass}`} />
          <span>{statusText}</span>
        </div>
      </header>

      <nav className="mic-panel__nav">
        <div className="mic-panel__tabs">
          <button
            className={`mic-panel__tab ${activeSection === 'audio' ? 'mic-panel__tab--active' : ''}`}
            onClick={() => setActiveSection('audio')}
          >
            <Settings size={14} />
            <span>Audio</span>
          </button>
          <button
            className={`mic-panel__tab ${activeSection === 'shortcuts' ? 'mic-panel__tab--active' : ''}`}
            onClick={() => setActiveSection('shortcuts')}
          >
            <Keyboard size={14} />
            <span>Hotkeys</span>
          </button>
          <button
            className={`mic-panel__tab ${activeSection === 'startup' ? 'mic-panel__tab--active' : ''}`}
            onClick={() => setActiveSection('startup')}
          >
            <Power size={14} />
            <span>Startup</span>
          </button>
          <button
            className={`mic-panel__tab ${activeSection === 'notifications' ? 'mic-panel__tab--active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <Bell size={14} />
            <span>Alerts</span>
          </button>
        </div>
      </nav>

      <main className="mic-panel__content">
        {activeSection === 'audio' && (
          <div className="u-fade-in">
            <h2 className="mic-panel__section-title">Microphone</h2>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">Toggle Mute</span>
                <span className="mic-panel__setting-description">Manually switch microphone state</span>
              </div>
              <button
                className={`mic-panel__button ${isMuted ? 'mic-panel__button--primary' : ''}`}
                onClick={() => void onToggleMute()}
                disabled={isMutePending}
              >
                {isMuted ? <MicOff size={14} className="mic-panel__button-icon" /> : <Mic size={14} className="mic-panel__button-icon" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">Input Device</span>
                <span className="mic-panel__setting-description">Choose active recording device</span>
              </div>
              <div className="mic-panel__select-wrap">
                <select
                  className="mic-panel__select"
                  value={selectedMicrophoneId}
                  onChange={(e) => void onMicrophoneChange(e.target.value)}
                >
                  {microphones.map((m, i) => (
                    <option key={m.deviceId} value={m.deviceId}>
                      {m.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="mic-panel__select-caret" />
              </div>
            </div>
            {error && <p className="mic-panel__error">{error}</p>}
          </div>
        )}

        {activeSection === 'shortcuts' && (
          <div className="u-fade-in">
            <h2 className="mic-panel__section-title">Global Shortcut</h2>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">Activation Hotkey</span>
                <span className="mic-panel__setting-description">Press to toggle mute globally</span>
              </div>
              <input
                className="mic-panel__input"
                value={isCapturingShortcut ? 'Press keys...' : (draftShortcut || 'Click to set')}
                onFocus={() => setIsCapturingShortcut(true)}
                onBlur={() => setIsCapturingShortcut(false)}
                onKeyDown={handleShortcutCapture}
                readOnly
                placeholder="Click to set..."
              />
            </div>
            <div className="mic-panel__actions">
              <button
                className="mic-panel__button mic-panel__button--danger"
                onClick={() => {
                  setDraftShortcut(null);
                  void onSaveShortcut(null);
                }}
                disabled={isSavingShortcut || !shortcut}
              >
                Clear
              </button>
              <button
                className="mic-panel__button mic-panel__button--primary"
                onClick={() => void onSaveShortcut(draftShortcut)}
                disabled={isSavingShortcut || draftShortcut === shortcut}
              >
                {isSavingShortcut ? 'Saving...' : 'Save Shortcut'}
              </button>
            </div>
            {shortcutError && <p className="mic-panel__error">{shortcutError}</p>}
          </div>
        )}

        {activeSection === 'startup' && (
          <div className="u-fade-in">
            <h2 className="mic-panel__section-title">Application</h2>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">Launch at Login</span>
                <span className="mic-panel__setting-description">Start MicMute when you log in</span>
              </div>
              <label className="mic-panel__switch">
                <input
                  type="checkbox"
                  checked={startupSettings.openAtLogin}
                  disabled={!startupSettings.supported || isSavingStartup}
                  onChange={(e) => void onToggleStartupOpenAtLogin(e.target.checked)}
                />
                <span className="mic-panel__switch-slider"></span>
              </label>
            </div>
            {startupError && <p className="mic-panel__error">{startupError}</p>}
            {!startupSettings.supported && <p className="mic-panel__setting-description mic-panel__setting-description--padded">Not supported on this platform</p>}
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="u-fade-in">
            <h2 className="mic-panel__section-title">Feedback</h2>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">System Notifications</span>
                <span className="mic-panel__setting-description">Show banner when state changes</span>
              </div>
              <label className="mic-panel__switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.showTrayNotificationOnMuteChange}
                  disabled={isSavingNotificationSettings}
                  onChange={(e) => void onPatchNotificationSettings({showTrayNotificationOnMuteChange: e.target.checked})}
                />
                <span className="mic-panel__switch-slider"></span>
              </label>
            </div>
            <div className="mic-panel__setting">
              <div className="mic-panel__setting-info">
                <span className="mic-panel__setting-label">Sound Effects</span>
                <span className="mic-panel__setting-description">Play audio cue on toggle</span>
              </div>
              <label className="mic-panel__switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.playSoundOnMuteToggle}
                  disabled={isSavingNotificationSettings}
                  onChange={(e) => void onPatchNotificationSettings({playSoundOnMuteToggle: e.target.checked})}
                />
                <span className="mic-panel__switch-slider"></span>
              </label>
            </div>
            {notificationSettingsError && <p className="mic-panel__error">{notificationSettingsError}</p>}
          </div>
        )}
      </main>

      <footer className="mic-panel__footer">
        <div className="mic-panel__hint">
          {shortcut ? <><Kbd keys={shortcut} /> <span>to Toggle</span></> : <span>No shortcut set</span>}
        </div>
        <div className="mic-panel__hint">
          <kbd className="mic-panel__kbd">Enter</kbd> <span>Select</span>
        </div>
      </footer>
    </div>
  );
}
