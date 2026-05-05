import {useMicrophoneDevices} from './application/audio/useMicrophoneDevices';
import {useMicrophoneShortcut} from './application/audio/useMicrophoneShortcut';
import {useSystemMicrophoneMute} from './application/audio/useSystemMicrophoneMute';
import {MicrophonePanel} from './presentation/microphone/MicrophonePanel';

function App() {
  const {
    microphones,
    selectedMicrophoneId,
    activeMicrophoneName,
    devicesError,
    selectMicrophone,
  } = useMicrophoneDevices();
  const {isMuted, isMutePending, muteError, toggleMute} = useSystemMicrophoneMute();
  const {shortcut, isSavingShortcut, shortcutError, saveShortcut} = useMicrophoneShortcut();

  return (
    <MicrophonePanel
      microphones={microphones}
      selectedMicrophoneId={selectedMicrophoneId}
      activeMicrophoneName={activeMicrophoneName}
      isMuted={isMuted}
      isMutePending={isMutePending}
      shortcut={shortcut}
      isSavingShortcut={isSavingShortcut}
      error={muteError || devicesError}
      shortcutError={shortcutError}
      onMicrophoneChange={selectMicrophone}
      onToggleMute={toggleMute}
      onSaveShortcut={saveShortcut}
    />
  );
}

export default App;
