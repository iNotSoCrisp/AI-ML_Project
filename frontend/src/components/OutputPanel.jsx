import { useState } from 'react';
import KeyTerms from './KeyTerms';
import TopicClusters from './TopicClusters';
import Summary from './Summary';

const TABS = [
    { id: 'terms', icon: '🔑', label: 'Key Terms' },
    { id: 'clusters', icon: '🗂️', label: 'Topic Clusters' },
    { id: 'summary', icon: '📝', label: 'Summary' },
];

/* Pipeline steps shown while loading */
const PIPELINE = [
    'Tokenization & stop-word removal',
    'Lemmatization',
    'TF-IDF / BoW feature extraction',
    'Topic modeling (LDA / K-Means)',
    'Extractive summarization',
    'Scoring & ranking',
];

export default function OutputPanel({ result, loading, error, step }) {
    const [activeTab, setActiveTab] = useState('terms');

    /* ── Loading State ── */
    if (loading) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-header-icon" style={{ background: 'var(--teal-soft)' }}>⚡</div>
                    <span className="panel-title">NLP Pipeline Running…</span>
                </div>
                <div className="pipeline">
                    {PIPELINE.map((s, i) => (
                        <div
                            key={s}
                            className={`pipeline-step ${i < step ? 'done' : i === step ? 'active' : ''}`}
                        >
                            <span className="pipeline-icon">
                                {i < step ? '✅' : i === step ? '⚙️' : '○'}
                            </span>
                            {s}
                        </div>
                    ))}
                </div>
                <div className="panel-body" style={{ gap: '0.6rem' }}>
                    {[100, 80, 60, 85].map((w, i) => (
                        <div key={i} className="skeleton" style={{ height: 16, width: `${w}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Error State ── */
    if (error) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-header-icon" style={{ background: 'rgba(248,113,113,0.12)' }}>⚠️</div>
                    <span className="panel-title">Analysis Failed</span>
                </div>
                <div className="panel-body">
                    <div className="error-box">
                        <span>🚨</span>
                        <span>{error}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Make sure the Python backend is running on <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 4 }}>http://localhost:8000</code> and try again.
                    </p>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (!result) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-header-icon" style={{ background: 'var(--green-soft)' }}>📊</div>
                    <span className="panel-title">Analysis Results</span>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">🧬</div>
                    <div className="empty-state-title">Ready to Analyze</div>
                    <div className="empty-state-desc">
                        Results will appear here after running the NLP pipeline
                    </div>
                    <div className="empty-steps">
                        {['Add research topic keywords', 'Upload documents (optional)', 'Click "Run NLP Analysis"'].map((s, i) => (
                            <div key={s} className="empty-step">
                                <span className="empty-step-num">{i + 1}</span>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Results ── */
    const { terms, clusters, summary, meta } = result;

    return (
        <div className="output-panel">
            {/* Summary stats strip */}
            <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
                    {[
                        { icon: '🔑', label: 'Key Terms', val: terms?.length ?? 0 },
                        { icon: '🗂️', label: 'Topic Clusters', val: clusters?.length ?? 0 },
                        { icon: '📝', label: 'Sentences', val: summary?.length ?? 0 },
                        { icon: '📄', label: 'Docs Processed', val: meta?.doc_count ?? 1 },
                        { icon: '⏱️', label: 'Time (s)', val: meta?.elapsed_s != null ? `${meta.elapsed_s.toFixed(2)}s` : '—' },
                    ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{s.icon}</span>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.val}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs + content */}
            <div className="panel">
                <div style={{ padding: '1rem 1.5rem 0' }}>
                    <div className="tabs">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                id={`tab-${t.id}`}
                                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                <span>{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="panel-body">
                    {activeTab === 'terms' && <KeyTerms terms={terms} />}
                    {activeTab === 'clusters' && <TopicClusters clusters={clusters} />}
                    {activeTab === 'summary' && (
                        <Summary
                            sentences={summary}
                            wordCount={meta?.word_count}
                            sentCount={meta?.sent_count}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
