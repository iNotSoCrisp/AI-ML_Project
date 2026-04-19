import { useState } from 'react';

/* ─── Lightweight Markdown renderer ───────────────── */
function parseMarkdown(md) {
    // Split into lines and build section blocks
    const lines = md.split('\n');
    const sections = [];
    let current = null;

    for (const raw of lines) {
        const line = raw;
        if (line.startsWith('# ')) {
            if (current) sections.push(current);
            current = { type: 'title', title: line.slice(2).trim(), lines: [] };
        } else if (line.startsWith('## ')) {
            if (current) sections.push(current);
            current = { type: 'section', title: line.slice(3).trim(), lines: [] };
        } else {
            if (!current) current = { type: 'body', title: '', lines: [] };
            current.lines.push(line);
        }
    }
    if (current) sections.push(current);
    return sections;
}

function renderInline(text) {
    // Bold, italic, code, links
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
            '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function RenderLines({ lines }) {
    const elements = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === '') { i++; continue; }

        // Bullet list
        if (line.match(/^[-*•]\s/)) {
            const items = [];
            while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
                items.push(lines[i].replace(/^[-*•]\s/, '').trim());
                i++;
            }
            elements.push(
                <ul key={i} className="report-list">
                    {items.map((item, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
                    ))}
                </ul>
            );
            continue;
        }

        // Numbered list
        if (line.match(/^\d+\.\s/)) {
            const items = [];
            while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
                items.push(lines[i].replace(/^\d+\.\s/, '').trim());
                i++;
            }
            elements.push(
                <ol key={i} className="report-list report-list-ol">
                    {items.map((item, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
                    ))}
                </ol>
            );
            continue;
        }

        // URL line (source)
        if (line.trim().startsWith('http')) {
            const url = line.trim();
            elements.push(
                <a key={i} href={url} target="_blank" rel="noreferrer" className="report-source-link">
                    <span className="report-source-icon">🔗</span>
                    <span>{url}</span>
                </a>
            );
            i++;
            continue;
        }

        // Paragraph
        elements.push(
            <p key={i} className="report-para"
                dangerouslySetInnerHTML={{ __html: renderInline(line.trim()) }}
            />
        );
        i++;
    }
    return <>{elements}</>;
}

/* ─── Section config ─────────────────────────────── */
const SECTION_CONFIGS = {
    'Abstract': { icon: '📄', color: 'var(--teal)', bg: 'var(--teal-soft)' },
    'Key Findings': { icon: '🔑', color: 'var(--amber)', bg: 'var(--amber-soft)' },
    'Sources': { icon: '🔗', color: 'var(--green)', bg: 'var(--green-soft)' },
    'Conclusion': { icon: '✅', color: 'var(--purple)', bg: 'var(--purple-soft)' },
};

function getSectionConfig(title) {
    for (const [key, cfg] of Object.entries(SECTION_CONFIGS)) {
        if (title.toLowerCase().includes(key.toLowerCase())) return { ...cfg, matched: true };
    }
    return { icon: '📌', color: 'var(--accent)', bg: 'var(--accent-soft)', matched: false };
}

/* ─── Follow-up questions ────────────────────────── */
function generateFollowUps(query) {
    const q = query.toLowerCase();
    return [
        `What are the limitations of current approaches to "${query}"?`,
        `How does "${query.split(' ').slice(0, 5).join(' ')}" compare to prior state-of-the-art?`,
        `What future research directions exist beyond "${query.split(' ').slice(0, 4).join(' ')}"?`,
    ];
}

/* ─── Main ReportPanel ───────────────────────────── */
export default function ReportPanel({ report, loading, error, query, agentStep }) {
    const [copied, setCopied] = useState(false);
    const [showFollowups, setShowFollowups] = useState(false);

    const handleCopy = () => {
        if (!report) return;
        navigator.clipboard.writeText(report).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        if (!report) return;
        const slug = (query || 'research').toLowerCase().replace(/\s+/g, '_').slice(0, 40);
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pluto_report_${slug}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── Loading State ── */
    const AGENT_STEPS_LABELS = [
        { icon: '🔍', label: 'Searching the web…', sub: 'DuckDuckGo · 5 sources' },
        { icon: '🧠', label: 'Analyzing findings…', sub: 'Gemini 1.5 Flash · extracting insights' },
        { icon: '📋', label: 'Writing report…', sub: 'Composing structured Markdown' },
    ];

    if (loading) {
        return (
            <div className="panel" style={{ minHeight: 400 }}>
                <div className="panel-header">
                    <div className="panel-header-icon" style={{ background: 'var(--purple-soft)' }}>⚡</div>
                    <span className="panel-title">Agent Working…</span>
                </div>
                <div className="agent-loading-state">
                    <div className="agent-orb-container">
                        <div className="agent-orb" />
                        <div className="agent-orb-ring" />
                    </div>
                    <div className="agent-loading-steps">
                        {AGENT_STEPS_LABELS.map((s, i) => (
                            <div key={i} className={`agent-loading-step ${i < agentStep ? 'done' : i === agentStep ? 'active' : ''}`}>
                                <span>{i < agentStep ? '✅' : i === agentStep ? '⚙️' : '○'}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.icon} {s.label}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1rem', textAlign: 'center' }}>
                        This may take 15–30 seconds…
                    </p>
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
                    <span className="panel-title">Agent Failed</span>
                </div>
                <div className="panel-body">
                    <div className="error-box">
                        <span>🚨</span>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Research failed</div>
                            <div>{error}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        <p>Possible causes:</p>
                        <ul style={{ paddingLeft: '1.2rem' }}>
                            <li>Backend is not running or <code>GOOGLE_API_KEY</code> is missing</li>
                            <li>DuckDuckGo rate limit hit — try again in a moment</li>
                            <li>Network error between frontend and backend</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (!report) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-header-icon" style={{ background: 'var(--purple-soft)' }}>📋</div>
                    <span className="panel-title">Research Report</span>
                </div>
                <div className="empty-state">
                    <div className="agent-empty-orb">🤖</div>
                    <div className="empty-state-title">Agentic Research Assistant</div>
                    <div className="empty-state-desc">
                        Ask a research question and the AI agent will autonomously search the web,
                        extract key findings, and generate a structured report.
                    </div>
                    <div className="agent-feature-pills">
                        {['🔍 Web Search', '🧠 LLM Reasoning', '📋 Structured Report', '🔗 Source URLs', '📥 Export MD'].map(f => (
                            <span key={f} className="agent-feature-pill">{f}</span>
                        ))}
                    </div>
                    <div className="empty-steps">
                        {['Enter an open-ended research question', 'Click "Run Research Agent"', 'Review the structured report'].map((s, i) => (
                            <div key={s} className="empty-step">
                                <span className="empty-step-num" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>{i + 1}</span>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Report Rendered ── */
    const sections = parseMarkdown(report);
    const titleSection = sections.find(s => s.type === 'title');
    const bodySections = sections.filter(s => s !== titleSection);
    const followUps = generateFollowUps(query || 'this topic');

    return (
        <div className="report-panel">
            {/* Report Header Card */}
            <div className="panel report-header-card">
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span className="agent-report-badge">Agent Report · Milestone 2</span>
                            </div>
                            <h1 className="report-title">
                                {titleSection?.title || query || 'Research Report'}
                            </h1>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                🤖 Generated by LangGraph · Gemini 1.5 Flash · DuckDuckGo
                            </p>
                        </div>
                        {/* Export Actions */}
                        <div className="export-bar">
                            <button id="copy-report-btn" className="export-btn" onClick={handleCopy} title="Copy Markdown">
                                {copied ? '✅ Copied!' : '📋 Copy'}
                            </button>
                            <button id="download-report-btn" className="export-btn export-btn-primary" onClick={handleDownload} title="Download .md">
                                📥 Download .md
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Cards */}
            {bodySections.map((section, i) => {
                const cfg = getSectionConfig(section.title);
                return (
                    <div key={i} className="panel report-section">
                        <div className="report-section-header" style={{ borderLeftColor: cfg.color }}>
                            <div className="report-section-icon" style={{ background: cfg.bg, color: cfg.color }}>
                                {cfg.icon}
                            </div>
                            <h2 className="report-section-title" style={{ color: cfg.color }}>
                                {section.title}
                            </h2>
                        </div>
                        <div className="report-section-body">
                            <RenderLines lines={section.lines} />
                        </div>
                    </div>
                );
            })}

            {/* Follow-up Questions */}
            <div className="panel report-followup-card">
                <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => setShowFollowups(v => !v)}>
                    <div className="panel-header-icon" style={{ background: 'var(--purple-soft)' }}>💬</div>
                    <span className="panel-title">Follow-up Questions</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {showFollowups ? '▲ Hide' : '▼ Expand'}
                    </span>
                </div>
                {showFollowups && (
                    <div className="panel-body" style={{ gap: '0.6rem' }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Explore deeper with these follow-up research queries:
                        </p>
                        {followUps.map((q, i) => (
                            <div key={i} className="followup-item">
                                <span className="followup-num">{i + 1}</span>
                                <span>{q}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
