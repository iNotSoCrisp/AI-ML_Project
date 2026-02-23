const TERM_LEVELS = ['term-lv1', 'term-lv2', 'term-lv3', 'term-lv4', 'term-lv5'];

export default function KeyTerms({ terms }) {
    if (!terms || terms.length === 0) return (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No terms found.</p>
    );

    // Sort by score desc, assign visual weight by rank
    const sorted = [...terms].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return (
        <div className="term-cloud">
            {sorted.map((t, i) => {
                const lvl = Math.min(Math.floor((i / sorted.length) * 5), 4);
                const fontSize = Math.max(0.72, 0.95 - i * 0.012);
                return (
                    <span
                        key={t.term ?? t}
                        className={`term-pill ${TERM_LEVELS[lvl]}`}
                        style={{ fontSize: `${fontSize}rem` }}
                        title={`Score: ${typeof t.score === 'number' ? t.score.toFixed(4) : 'N/A'}`}
                    >
                        {t.term ?? t}
                        {typeof t.score === 'number' && (
                            <span className="term-score">{t.score.toFixed(3)}</span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
