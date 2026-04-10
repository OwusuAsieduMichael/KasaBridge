import { useState } from 'react';
import { aiChat } from '../services/api.js';

export default function ChatHelperPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setError('');
    setInput('');
    const prev = messages;
    const next = [...prev, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await aiChat(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Chat failed');
      setMessages(prev);
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
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>AI helper</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        Ask for usage tips or cultural context (six supported languages only).
      </p>
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: '#0c0f14',
          border: '1px solid var(--border)',
          fontSize: '0.9rem',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--muted)' }}>No messages yet.</p>
        ) : (
          messages.map((m, i) => (
            <p key={i} style={{ margin: '0 0 0.65rem', whiteSpace: 'pre-wrap' }}>
              <strong style={{ color: m.role === 'user' ? 'var(--accent)' : 'var(--muted)' }}>
                {m.role === 'user' ? 'You' : 'Assistant'}:
              </strong>{' '}
              {m.content}
            </p>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: '#0c0f14',
            color: 'var(--text)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--border)',
            color: 'var(--text)',
            fontWeight: 600,
          }}
        >
          {loading ? '…' : 'Send'}
        </button>
      </form>
      {error ? <p style={{ color: 'var(--danger)', marginTop: '0.75rem' }}>{error}</p> : null}
    </section>
  );
}
