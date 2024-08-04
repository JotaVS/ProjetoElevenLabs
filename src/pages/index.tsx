import { useState, useEffect, useRef } from 'react';

interface Voice {
  voice_id: string;
  name: string;
  description: string | null;
  category: string;
  labels: {
    description: string;
    use_case: string;
    accent: string;
    age: string;
    gender: string;
  };
  preview_url: string;
}

const Page = () => {
  const [text, setText] = useState('');
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const previewAudioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/get-voices');
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        const data = await response.json();
        setVoices(data.voices);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVoices();
  }, []);

  const handlePlayPausePreview = (voiceId: string) => {
    const audio = previewAudioRefs.current[voiceId];

    if (!audio) return;

    if (playingPreviewId === voiceId) {
      audio.pause();
      setPlayingPreviewId(null);
    } else {
      if (playingPreviewId && previewAudioRefs.current[playingPreviewId]) {
        previewAudioRefs.current[playingPreviewId]?.pause();
      }
      audio.play();
      setPlayingPreviewId(voiceId);
    }
  };

  const handlePlayPause = async (voiceId: string) => {
    const audio = customAudioRef.current;

    if (!audio) return;

    if (selectedVoiceId === voiceId && currentText === text) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    setLoading(true);
    setSelectedVoiceId(voiceId);
    setCurrentText(text);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceId, text })
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const data = await response.json();
      audio.src = data.url;
      audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
        rows={2}
        cols={50}
        className="text-area"
      />
      <br />
      {voices.map((voice) => (
        <div key={voice.voice_id} className="voice-card">
          <div className="voice-info">
            <strong>{voice.name}</strong>
            <div className="voice-labels">
              <div>Categoria: {voice.category}</div>
              <div>Gender: {voice.labels.gender}</div>
              <div>Accent: {voice.labels.accent}</div>
              <div>Age: {voice.labels.age}</div>
              <div>Description: {voice.labels.description}</div>
              <div>Use Case: {voice.labels.use_case}</div>
            </div>
          </div>
          {text && (
            <button
              onClick={() => handlePlayPause(voice.voice_id)}
              className="button"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isPlaying && selectedVoiceId === voice.voice_id ? 'Pause' : 'Play')}
            </button>
          )}
          <button
            onClick={() => handlePlayPausePreview(voice.voice_id)}
            className="button"
          >
            {playingPreviewId === voice.voice_id ? 'Pause Teste' : 'Play Teste'}
          </button>
          <audio
            ref={(el) => { previewAudioRefs.current[voice.voice_id] = el; }}
            src={voice.preview_url}
            onEnded={() => setPlayingPreviewId(null)}
            style={{ display: 'none' }}
          />
          <audio
            ref={customAudioRef}
            style={{ display: 'none' }}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      ))}
    </div>
  );
};

export default Page;
