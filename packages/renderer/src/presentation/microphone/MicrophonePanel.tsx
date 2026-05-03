import type {ChangeEvent} from 'react';

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
    <main>
      <h1>Microphones</h1>
      {error ? <p>{error}</p> : null}
      {microphones.length === 0 ? (
        <p>No microphones detected.</p>
      ) : (
        <>
          <label htmlFor="microphone-select">Selected microphone</label>
          <div>
            <select
              id="microphone-select"
              value={selectedMicrophoneId}
              onChange={(event) => void handleChange(event)}
            >
              {microphones.map((microphone, index) => (
                <option key={microphone.deviceId} value={microphone.deviceId}>
                  {microphone.label || `Microphone ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => void onToggleMute()} disabled={isMutePending}>
            {isMuted ? 'Unmute microphone' : 'Mute microphone'}
          </button>
          <p>In use: {activeMicrophoneName}</p>
          <p>Microphone status: {isMuted ? 'Muted' : 'Unmuted'}</p>
        </>
      )}
    </main>
  );
}
