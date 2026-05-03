import type {ChangeEvent} from 'react';
import {
  AudioLines,
  CircleHelp,
  Info,
  Keyboard,
  Mic,
  MicOff,
  Play,
  Plug,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';

type Props = {
  microphones: MediaDeviceInfo[];
  selectedMicrophoneId: string;
  activeMicrophoneName: string;
  isMuted: boolean;
  isMutePending: boolean;
  error: string | null;
  onMicrophoneChange: (deviceId: string) => Promise<void>;
  onToggleMute: () => Promise<void>;
};

export function MicrophonePanel({
  microphones,
  selectedMicrophoneId,
  activeMicrophoneName,
  isMuted,
  isMutePending,
  error,
  onMicrophoneChange,
  onToggleMute,
}: Props) {
  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await onMicrophoneChange(event.target.value);
  };

  return (
    <main className="desktop-app">
      <section className="window-frame">
        <header className="window-toolbar">
          <div className="window-title-wrap">
            <p className="window-caption">Microphone Utility</p>
            <h1>Input Control</h1>
          </div>
          <div className="window-actions">
            <button type="button" className="toolbar-button">
              <span className="icon" aria-hidden="true"><Settings size={14} strokeWidth={1.8} /></span>
              <span>Settings</span>
            </button>
            <button type="button" className="toolbar-button">
              <span className="icon" aria-hidden="true"><SlidersHorizontal size={14} strokeWidth={1.8} /></span>
              <span>Preferences</span>
            </button>
            <button type="button" className="toolbar-button">
              <span className="icon" aria-hidden="true"><CircleHelp size={14} strokeWidth={1.8} /></span>
              <span>Help</span>
            </button>
          </div>
        </header>

        <div className="workspace">
          <aside className="sidebar">
            <button type="button" className="nav-item active">
              <span className="icon" aria-hidden="true"><AudioLines size={14} strokeWidth={1.8} /></span>
              <span>Audio</span>
            </button>
            <button type="button" className="nav-item">
              <span className="icon" aria-hidden="true"><Plug size={14} strokeWidth={1.8} /></span>
              <span>Devices</span>
            </button>
            <button type="button" className="nav-item">
              <span className="icon" aria-hidden="true"><Keyboard size={14} strokeWidth={1.8} /></span>
              <span>Shortcuts</span>
            </button>
            <button type="button" className="nav-item">
              <span className="icon" aria-hidden="true"><Play size={14} strokeWidth={1.8} /></span>
              <span>Startup</span>
            </button>
            <button type="button" className="nav-item">
              <span className="icon" aria-hidden="true"><Info size={14} strokeWidth={1.8} /></span>
              <span>About</span>
            </button>
          </aside>

          <section className="content-pane">
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
          </section>
        </div>
      </section>
    </main>
  );
}
