import { useRef, useState } from 'react';
import LanguageSelect from './LanguageSelect.jsx';
import { processSpeechAudio, speakText } from '../services/api.js';

function useMediaRecorder() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const chunksRef = useRef([]);
  const mediaRef = useRef(null);
  const recRef = useRef(null);

  async function start() {
    setError('');
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = stream;
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime });
    recRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.start(250);
    setRecording(true);
  }

  function stop() {
    return new Promise((resolve, reject) => {
      const rec = recRef.current;
      if (!rec || rec.state === 'inactive') {
        setRecording(false);
        mediaRef.current?.getTracks().forEach((t) => t.stop());
        resolve(null);
        return;
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        mediaRef.current?.getTracks().forEach((t) => t.stop());
        recRef.current = null;
        mediaRef.current = null;
        setRecording(false);
        resolve(blob);
      };
      rec.onerror = () => {
        setRecording(false);
        reject(new Error('Recording failed'));
      };
      rec.stop();
    });
  }

  return { recording, error, setError, start, stop };
}

export default function SpeechPanel() {
  const { recording, error: recError, setError: setRecError, start, stop } = useMediaRecorder();
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);

  async function handleRecordClick() {
    setError('');
    setResult(null);
    if (recording) {
      setLoading(true);
      try {
        const blob = await stop();
        if (!blob || blob.size === 0) {
          setError('No audio captured.');
          return;
        }
        const fd = new FormData();
        fd.append('audio', blob, 'recording.webm');
        if (target) fd.append('targetLanguage', target);
        const data = await processSpeechAudio(fd);
        setResult(data);
      } catch (e) {
        setError(e.message || 'Speech processing failed');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await start();
      } catch (e) {
        setRecError(e.message || 'Microphone access denied');
      }
    }
  }

  async function playTts() {
    const text = result?.translatedText || result?.transcript;
    if (!text?.trim()) return;
    setPlaying(true);
    setError('');
    try {
      const lang = target || result?.sourceLanguage || 'english';
      const data = await speakText(text, lang, 'json');
      if (data.audioBase64 && data.mimeType) {
        const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          setPlaying(false);
          fallbackSpeak(text);
        };
        await audio.play();
      } else {
        setPlaying(false);
        fallbackSpeak(text);
      }
    } catch {
      setPlaying(false);
      fallbackSpeak(result?.translatedText || result?.transcript);
    }
  }

  function fallbackSpeak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  const displayError = error || recError;

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Speech</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        Record audio → Whisper on the server. Optionally choose a target language to translate after
        transcription.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <LanguageSelect
          id="speech-target"
          label="Translate to (optional)"
          value={target}
          onChange={setTarget}
          disabled={loading || recording}
          allowEmpty
        />
        <button
          type="button"
          onClick={handleRecordClick}
          disabled={loading}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: recording ? '2px solid var(--danger)' : 'none',
            background: recording
              ? 'transparent'
              : 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
            color: recording ? 'var(--danger)' : '#042f2e',
            fontWeight: 600,
          }}
        >
          {loading ? 'Processing…' : recording ? 'Stop & send' : 'Start recording'}
        </button>
      </div>
      {displayError ? (
        <p style={{ color: 'var(--danger)', marginTop: '1rem', marginBottom: 0 }}>{displayError}</p>
      ) : null}
      {result ? (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            background: '#0c0f14',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
            Transcript ({result.sourceLanguage})
          </p>
          <p style={{ margin: '0.35rem 0 0', whiteSpace: 'pre-wrap' }}>{result.transcript}</p>
          {result.translatedText ? (
            <>
              <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Translation
              </p>
              <p style={{ margin: '0.35rem 0 0', whiteSpace: 'pre-wrap' }}>{result.translatedText}</p>
            </>
          ) : null}
          <button
            type="button"
            onClick={playTts}
            disabled={playing}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
          >
            {playing ? 'Playing…' : 'Play speech (TTS or browser)'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
