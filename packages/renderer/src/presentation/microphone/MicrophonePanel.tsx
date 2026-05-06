import {useEffect, useMemo, useState} from 'react';
import type {ChangeEvent, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {
  AudioLines,
  Keyboard,
  Mic,
  MicOff,
  Bell,
  Play,
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
  if (key === ' ') {
    return 'Space';
  }

  if (key.length === 1) {
    return key.toUpperCase();
  }

  const aliases: Record<string, string> = {
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Esc',
    Delete: 'Delete',
    Insert: 'Insert',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Enter: 'Enter',
    Tab: 'Tab',
    Backspace: 'Backspace',
  };

  if (aliases[key]) {
    return aliases[key];
  }

  if (/^F\d{1,2}$/.test(key)) {
    return key;
  }

  return key;
}

export function MicrophonePanel({
  microphones,
  selectedMicrophoneId,
  activeMicrophoneName,
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

  const shortcutLabel = useMemo(() => {
    return draftShortcut ?? 'No shortcut';
  }, [draftShortcut]);

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await onMicrophoneChange(event.target.value);
  };

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

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
      return;
    }

    const key = keyToAccelerator(event.key);
    const next = [...modifiers, key].join('+');
    setDraftShortcut(next);
    setIsCapturingShortcut(false);
  };

  const handleSaveShortcut = async () => {
    await onSaveShortcut(draftShortcut);
  };

  return (
    <main className="desktop-app">
      <section className="window-frame">
        <header className="window-toolbar">
          <div className="window-title-wrap">
            <p className="window-caption">MicMute</p>
            <h1>Microphone Controls</h1>
          </div>
        </header>

        <div className="workspace">
          <aside className="sidebar">
            <button
              type="button"
              className={`nav-item ${activeSection === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveSection('audio')}
            >
              <span className="icon" aria-hidden="true"><AudioLines size={14} strokeWidth={1.8} /></span>
              <span>Audio</span>
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveSection('shortcuts')}
            >
              <span className="icon" aria-hidden="true"><Keyboard size={14} strokeWidth={1.8} /></span>
              <span>Shortcuts</span>
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'startup' ? 'active' : ''}`}
              onClick={() => setActiveSection('startup')}
            >
              <span className="icon" aria-hidden="true"><Play size={14} strokeWidth={1.8} /></span>
              <span>Startup</span>
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <span className="icon" aria-hidden="true"><Bell size={14} strokeWidth={1.8} /></span>
              <span>Notifications</span>
            </button>
          </aside>

          <section className="content-pane">
            {activeSection === 'audio' ? (
              <>
                <div className="section-header">
                  <h2>Microphone</h2>
                  <span className={`status-pill ${isMuted ? 'muted' : 'live'}`}>
                    {isMuted ? 'Muted' : 'Active'}
                  </span>
                </div>

                {error ? <p className="error-text">{error}</p> : null}

                {microphones.length === 0 ? (
                  <p className="empty-state">No microphones detected.</p>
                ) : (
                  <>
                    <label htmlFor="microphone-select" className="field-label">Selected microphone</label>
                    <select
                      id="microphone-select"
                      className="select-field"
                      value={selectedMicrophoneId}
                      onChange={(event) => void handleChange(event)}
                    >
                      {microphones.map((microphone, index) => (
                        <option key={microphone.deviceId} value={microphone.deviceId}>
                          {microphone.label || `Microphone ${index + 1}`}
                        </option>
                      ))}
                    </select>

                    <div className="info-grid">
                      <div className="info-row">
                        <p className="info-label">In use</p>
                        <p className="info-value">{activeMicrophoneName}</p>
                      </div>
                      <div className="info-row">
                        <p className="info-label">Detected devices</p>
                        <p className="info-value">{microphones.length}</p>
                      </div>
                    </div>

                    <div className="action-row">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => void onToggleMute()}
                        disabled={isMutePending}
                      >
                        <span className="icon" aria-hidden="true">
                          {isMuted ? <Mic size={14} strokeWidth={1.8} /> : <MicOff size={14} strokeWidth={1.8} />}
                        </span>
                        <span>{isMutePending ? 'Updating...' : isMuted ? 'Unmute microphone' : 'Mute microphone'}</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : activeSection === 'shortcuts' ? (
              <>
                <div className="section-header">
                  <h2>Shortcuts</h2>
                </div>

                <div className="shortcut-card">
                  <p className="field-label">Global mute shortcut</p>
                  <p className="shortcut-value">{shortcutLabel}</p>
                  <input
                    className="shortcut-capture"
                    value={isCapturingShortcut ? 'Press keys...' : shortcutLabel}
                    onFocus={() => setIsCapturingShortcut(true)}
                    onBlur={() => setIsCapturingShortcut(false)}
                    onKeyDown={handleShortcutCapture}
                    readOnly
                  />
                  <div className="action-row">
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={() => setIsCapturingShortcut(true)}
                    >
                      Capture shortcut
                    </button>
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={() => void handleSaveShortcut()}
                      disabled={isSavingShortcut}
                    >
                      {isSavingShortcut ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={() => {
                        setDraftShortcut(null);
                        void onSaveShortcut(null);
                      }}
                      disabled={isSavingShortcut}
                    >
                      Clear
                    </button>
                  </div>
                  {shortcutError ? <p className="error-text">{shortcutError}</p> : null}
                </div>
              </>
            ) : activeSection === 'startup' ? (
              <>
                <div className="section-header">
                  <h2>Startup</h2>
                </div>

                <div className="shortcut-card">
                  <p className="field-label">Run app at system startup</p>
                  <p className="shortcut-value">{startupSettings.supported ? (startupSettings.openAtLogin ? 'Enabled' : 'Disabled') : 'Not supported on this platform'}</p>
                  <div className="action-row">
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={() => void onToggleStartupOpenAtLogin(!startupSettings.openAtLogin)}
                      disabled={!startupSettings.supported || isSavingStartup}
                    >
                      {isSavingStartup ? 'Saving...' : startupSettings.openAtLogin ? 'Disable auto-run' : 'Enable auto-run'}
                    </button>
                  </div>
                  {startupError ? <p className="error-text">{startupError}</p> : null}
                </div>
              </>
            ) : (
              <>
                <div className="section-header">
                  <h2>Notifications</h2>
                </div>

                <div className="shortcut-card">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={notificationSettings.showTrayNotificationOnMuteChange}
                      onChange={(event) => {
                        void onPatchNotificationSettings({showTrayNotificationOnMuteChange: event.target.checked});
                      }}
                      disabled={isSavingNotificationSettings}
                    />
                    <span>Show a desktop notification when microphone is muted or unmuted</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={notificationSettings.playSoundOnMuteToggle}
                      onChange={(event) => {
                        void onPatchNotificationSettings({playSoundOnMuteToggle: event.target.checked});
                      }}
                      disabled={isSavingNotificationSettings}
                    />
                    <span>Play a short sound when microphone state changes</span>
                  </label>

                  {notificationSettingsError ? <p className="error-text">{notificationSettingsError}</p> : null}
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
