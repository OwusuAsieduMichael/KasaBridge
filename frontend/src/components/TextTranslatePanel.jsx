import { useState } from 'react';
import LanguageSelect from './LanguageSelect.jsx';
import { translateText } from '../services/api.js';

export default function TextTranslatePanel() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('english');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await translateText(text, target);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Text translation</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="src-text" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Input (any supported language — auto-detected)
          </label>
          <textarea
            id="src-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text in English, Twi, Ga, Ewe, Fante, or Hausa…"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: '#0c0f14',
              color: 'var(--text)',
              resize: 'vertical',
            }}
          />
        </div>
        <LanguageSelect
          id="target-lang"
          label="Translate to"
          value={target}
          onChange={setTarget}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
            color: '#042f2e',
            fontWeight: 600,
          }}
        >
          {loading ? 'Translating…' : 'Translate'}
        </button>
      </form>
      {error ? (
        <p style={{ color: 'var(--danger)', marginTop: '1rem', marginBottom: 0 }}>{error}</p>
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
            Detected: <strong style={{ color: 'var(--text)' }}>{result.sourceLanguage}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>{result.translatedText}</p>
        </div>
      ) : null}
    </section>
  );
}
