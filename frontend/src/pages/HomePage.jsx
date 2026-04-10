import TextTranslatePanel from '../components/TextTranslatePanel.jsx';
import SpeechPanel from '../components/SpeechPanel.jsx';
import ChatHelperPanel from '../components/ChatHelperPanel.jsx';

export default function HomePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 600,
          }}
        >
          KasaBridge AI
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700 }}>
          Ghanaian speech & translation
        </h1>
        <p style={{ margin: '0.75rem 0 0', color: 'var(--muted)', fontSize: '0.95rem' }}>
          English, Twi, Ga, Ewe, Fante, and Hausa — detect, translate, and listen.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SpeechPanel />
        <TextTranslatePanel />
        <ChatHelperPanel />
      </div>
    </div>
  );
}
