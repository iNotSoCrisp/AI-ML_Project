import { useState } from 'react';

const AGENT_STEPS = [
    { id: 'search', icon: '🔍', label: 'Web Search', desc: 'Querying DuckDuckGo for relevant sources' },
    { id: 'analyze', icon: '🧠', label: 'LLM Analysis', desc: 'Extracting key findings with Gemini' },
    { id: 'report', icon: '📋', label: 'Report Generation', desc: 'Composing structured research report' },
];

const EXAMPLE_QUERIES = [
    'Recent advances in diffusion models for image generation',
    'Transformer architectures beyond attention mechanisms',
    'Reinforcement learning from human feedback (RLHF) techniques',
    'Graph neural networks for drug discovery',
    'Federated learning for privacy-preserving AI',
];

export default function AgentInputPanel({ onResearch, loading, agentStep }) {
    const [query, setQuery] = useState('');

    const canSubmit = query.trim().length > 10 && !loading;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onResearch(query.trim());
    };

    const onKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
    };

    const pickExample = (q) => {
        if (!loading) setQuery(q);
    };

    return (
        <aside className="panel agent-input-panel" style={{ position: 'sticky', top: '80px' }}>
            {/* Header */}
            <div className="panel-header">
                <div className="panel-header-icon" style={{ background: 'var(--purple-soft)' }}>🤖</div>
                <span className="panel-title">Agent Query</span>
                <span className="agent-badge">LangGraph</span>
            </div>

            <div className="panel-body">

                {/* Query Input */}
                <div>
                    <div className="field-label">
                        <span>💡</span> Research Query
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                        Ask anything — the agent will search the web and synthesize a structured report
                    </p>
                    <textarea
                        id="agent-query-input"
                        className="topic-input agent-textarea"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="e.g. What are the latest breakthroughs in multimodal AI models?"
                        disabled={loading}
                        rows={5}
                    />
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        ⌘ + Enter to run
                    </p>
                </div>

                {/* Example Queries */}
                <div>
                    <div className="field-label"><span>✨</span> Example Queries</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {EXAMPLE_QUERIES.map(q => (
                            <button
                                key={q}
                                className="example-query-btn"
                                onClick={() => pickExample(q)}
                                disabled={loading}
                                title={q}
                            >
                                <span style={{ color: 'var(--purple)', flexShrink: 0 }}>→</span>
                                <span>{q}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Agent Workflow Tracker */}
                <div>
                    <div className="field-label"><span>⚡</span> Agent Workflow</div>
                    <div className="agent-workflow">
                        {AGENT_STEPS.map((step, i) => {
                            let state = 'pending';
                            if (loading) {
                                if (i < agentStep) state = 'done';
                                else if (i === agentStep) state = 'active';
                            }
                            return (
                                <div key={step.id} className={`agent-step agent-step-${state}`}>
                                    <div className="agent-step-icon">
                                        {state === 'done' ? '✅' : state === 'active' ? (
                                            <span className="agent-spinner" />
                                        ) : (
                                            <span style={{ opacity: 0.3 }}>{i + 1}</span>
                                        )}
                                    </div>
                                    <div className="agent-step-content">
                                        <div className="agent-step-label">{step.icon} {step.label}</div>
                                        <div className="agent-step-desc">{step.desc}</div>
                                    </div>
                                    {i < AGENT_STEPS.length - 1 && (
                                        <div className={`agent-step-connector ${state === 'done' ? 'done' : ''}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Agent Info */}
                <div className="agent-info-box">
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        <div>🔗 <strong style={{ color: 'var(--text-secondary)' }}>Search:</strong> DuckDuckGo (5 results)</div>
                        <div>🤖 <strong style={{ color: 'var(--text-secondary)' }}>LLM:</strong> Gemini 1.5 Flash</div>
                        <div>🕸️ <strong style={{ color: 'var(--text-secondary)' }}>Framework:</strong> LangGraph</div>
                        <div>⏱️ <strong style={{ color: 'var(--text-secondary)' }}>Est. time:</strong> 15–30 seconds</div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    id="agent-run-btn"
                    className="btn-analyze btn-agent"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    {loading
                        ? <><span className="spinner" /> Agent Running…</>
                        : <><span>🚀</span> Run Research Agent</>}
                </button>

                {!loading && query.trim().length <= 10 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-0.5rem' }}>
                        Enter a detailed research question (at least 10 characters)
                    </p>
                )}
            </div>
        </aside>
    );
}
