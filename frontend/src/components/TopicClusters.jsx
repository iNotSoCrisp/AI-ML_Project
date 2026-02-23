const COLORS = [
    { dot: '#6366f1', bg: 'rgba(99,102,241,0.15)', text: '#6366f1' },
    { dot: '#22d3ee', bg: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
    { dot: '#4ade80', bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
    { dot: '#fbbf24', bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
    { dot: '#f472b6', bg: 'rgba(244,114,182,0.12)', text: '#f472b6' },
    { dot: '#a78bfa', bg: 'rgba(167,139,250,0.12)', text: '#a78bfa' },
];

export default function TopicClusters({ clusters }) {
    if (!clusters || clusters.length === 0) return (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No clusters found.</p>
    );

    return (
        <div className="cluster-grid">
            {clusters.map((c, i) => {
                const col = COLORS[i % COLORS.length];
                return (
                    <div key={i} className="cluster-card">
                        <div className="cluster-header">
                            <span className="cluster-dot" style={{ background: col.dot }} />
                            <span className="cluster-name">{c.label || `Topic ${i + 1}`}</span>
                            <span className="cluster-count">{c.doc_count ?? c.keywords?.length ?? 0} docs</span>
                        </div>
                        <div className="cluster-keywords">
                            {(c.keywords || []).map(kw => (
                                <span key={kw} className="cluster-kw">{kw}</span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
