export default function Summary({ sentences, wordCount, sentCount }) {
    if (!sentences || sentences.length === 0) return (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No summary generated.</p>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
                style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent)',
                }}
            >
                <p className="summary-text">
                    {sentences.map((s, i) => (
                        <span key={i} className="summary-sentence" title={`Sentence ${i + 1}`}>
                            {s.trim()}{' '}
                        </span>
                    ))}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                    { label: 'Sentences extracted', val: sentences.length },
                    { label: 'Approx. words', val: wordCount ?? sentences.join(' ').split(/\s+/).length },
                    { label: 'Source sentences', val: sentCount ?? '—' },
                ].map(s => (
                    <div
                        key={s.label}
                        style={{
                            padding: '0.5rem 0.9rem',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {s.val}
                        </span>{' '}
                        {s.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
