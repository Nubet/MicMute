import {useMicrophoneDevices} from './application/audio/useMicrophoneDevices';
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

  return (
    <MicrophonePanel
      microphones={microphones}
      selectedMicrophoneId={selectedMicrophoneId}
      activeMicrophoneName={activeMicrophoneName}
      isMuted={isMuted}
      isMutePending={isMutePending}
      error={muteError || devicesError}
      onMicrophoneChange={selectMicrophone}
      onToggleMute={toggleMute}
    />
  );
}

export default App;
