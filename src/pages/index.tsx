import { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Group, Text, Container, Textarea, Paper } from '@mantine/core';
import VoiceFilters from '../components/VoiceFilters';
import { useVoiceFilters } from '../hooks/useVoiceFilters';

export interface Voice {
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
      if (audio) {
        audio.src = data.url;
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { filters, setFilters, filteredVoices, filterValues } = useVoiceFilters(voices);

  return (
    <Paper 
      style={{ 
        backgroundColor: '#f7f9fc', 
        padding: '24px', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Container>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Insira seu texto aqui"
          minRows={2}
          maxRows={2}
          style={{ 
            width: '100%', 
            padding: '12px', 
            marginBottom: '16px', 
            borderRadius: '8px',
            borderColor: '#000000',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        />
        <VoiceFilters filters={filters} setFilters={setFilters} filterValues={filterValues} />
        <br />
        {filteredVoices.map((voice) => (
          <Card key={voice.voice_id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="xs" wrap="nowrap">
              <Text fw={500}>{voice.name}</Text>
              {!filters.category && <Badge color="blue" variant="light">{voice.category}</Badge>}
            </Group>

            <Text size="sm" color="dimmed">
              {!filters.gender && <Badge color="pink" variant="light" mr={6}>{voice.labels.gender}</Badge>}
              {!filters.accent && <Badge color="cyan" variant="light" mr={6}>{voice.labels.accent}</Badge>}
              {!filters.age && <Badge color="green" variant="light" mr={6}>{voice.labels.age}</Badge>}
              {!filters.use_case && <Badge color="orange" variant="light">{voice.labels.use_case}</Badge>}
            </Text>

            {text && (
              <Button
                onClick={() => handlePlayPause(voice.voice_id)}
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isPlaying && selectedVoiceId === voice.voice_id ? 'Pause' : 'Play')}
              </Button>
            )}

            <Button
              onClick={() => handlePlayPausePreview(voice.voice_id)}
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              radius="md"
            >
              {playingPreviewId === voice.voice_id ? 'Pause Preview' : 'Play Preview'}
            </Button>

            <audio
              ref={(el) => { previewAudioRefs.current[voice.voice_id] = el; }}
              src={voice.preview_url}
              onEnded={() => setPlayingPreviewId(null)}
              style={{ display: 'none' }}
            />
          </Card>
        ))}

        <audio
          ref={customAudioRef}
          style={{ display: 'none' }}
          onEnded={() => setIsPlaying(false)}
        />
      </Container>
    </Paper>
  );
};

export default Page;
