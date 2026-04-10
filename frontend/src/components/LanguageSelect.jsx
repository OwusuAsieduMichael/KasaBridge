const OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'twi', label: 'Twi' },
  { value: 'ga', label: 'Ga' },
  { value: 'ewe', label: 'Ewe' },
  { value: 'fante', label: 'Fante' },
  { value: 'hausa', label: 'Hausa' },
];

export default function LanguageSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  allowEmpty,
  emptyLabel = '— None —',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label ? (
        <label htmlFor={id} style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: '0.6rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
        }}
      >
        {allowEmpty ? (
          <option value="">
            {emptyLabel}
          </option>
        ) : null}
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { OPTIONS };
