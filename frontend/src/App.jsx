import { useState, useRef } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';

// Vite proxy forwards /api → http://localhost:8000 in dev
// Set VITE_API_URL in .env for production (e.g. https://your-app.onrender.com)
const API_BASE = import.meta.env.VITE_API_URL || '';

/* ── demo mock data (used when backend is unreachable) ── */
const MOCK_RESULT = {
  terms: [
    { term: 'neural network', score: 0.872 },
    { term: 'deep learning', score: 0.841 },
    { term: 'natural language processing', score: 0.793 },
    { term: 'transformer', score: 0.761 },
    { term: 'attention mechanism', score: 0.734 },
    { term: 'text classification', score: 0.701 },
    { term: 'feature extraction', score: 0.682 },
    { term: 'TF-IDF', score: 0.655 },
    { term: 'topic modeling', score: 0.638 },
    { term: 'word embedding', score: 0.612 },
    { term: 'BERT', score: 0.589 },
    { term: 'corpus', score: 0.562 },
    { term: 'tokenization', score: 0.541 },
    { term: 'lemmatization', score: 0.519 },
  ],
  clusters: [
    {
      label: 'Neural Language Models',
      keywords: ['BERT', 'transformer', 'attention', 'GPT', 'pre-training'],
      doc_count: 12,
    },
    {
      label: 'Text Preprocessing',
      keywords: ['tokenization', 'lemmatization', 'stop-words', 'stemming'],
      doc_count: 9,
    },
    {
      label: 'Feature Engineering',
      keywords: ['TF-IDF', 'bag-of-words', 'n-grams', 'embeddings'],
      doc_count: 8,
    },
    {
      label: 'Topic Modeling',
      keywords: ['LDA', 'clustering', 'coherence', 'topics', 'k-means'],
      doc_count: 7,
    },
    {
      label: 'Summarization',
      keywords: ['extractive', 'TextRank', 'sentence scoring', 'compression'],
      doc_count: 5,
    },
  ],
  summary: [
    'Natural language processing (NLP) encompasses a broad set of techniques enabling computers to understand, interpret, and generate human language.',
    'TF-IDF remains a foundational method for identifying the relative importance of terms within a document corpus.',
    'Topic modeling approaches such as Latent Dirichlet Allocation (LDA) uncover hidden thematic structures across large collections of text.',
    'Extractive summarization selects the most informative sentences from source documents to produce concise, representative summaries.',
  ],
  meta: {
    doc_count: 1,
    elapsed_s: 1.23,
    word_count: 312,
    sent_count: 18,
  },
};

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(null);

  const advanceStep = () => {
    setStep(s => s + 1);
  };

  const handleAnalyze = async ({ keywords, files, numTopics, summaryLen, useBoW }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStep(0);

    /* Simulate pipeline progress */
    const interval = setInterval(advanceStep, 700);

    try {
      const form = new FormData();
      keywords.forEach(k => form.append('keywords', k));
      form.append('num_topics', numTopics);
      form.append('summary_sentences', summaryLen);
      form.append('use_bow', useBoW ? 'true' : 'false');
      files.forEach(f => form.append('files', f));

      const res = await fetch(`${API_BASE}/api/v1/ml/analyze`, {
        method: 'POST',
        body: form,
      });

      clearInterval(interval);

      if (!res.ok) {
        const msg = await res.text().catch(() => 'Server error');
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      clearInterval(interval);

      /* If backend is not running, fall back to mock data in dev */
      const isDev = import.meta.env.DEV;
      if (isDev && (err instanceof TypeError || err.message.includes('fetch'))) {
        console.warn('[Pluto] Backend unreachable — showing mock data');
        setResult(MOCK_RESULT);
      } else {
        setError(err.message || 'Unknown error. Check the backend server.');
      }
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-icon">🔬</div>
          <span className="header-title">Pluto</span>
        </div>
        <span className="header-badge">Milestone 1 · NLP Pipeline</span>
      </header>

      {/* ── Main Grid ── */}
      <main className="main">
        <InputPanel onAnalyze={handleAnalyze} loading={loading} />
        <OutputPanel result={result} loading={loading} error={error} step={step} />
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>Pluto — Traditional NLP Analysis System · Milestone 1</span>
        <div className="footer-links">
          <a href="https://www.kaggle.com/datasets/Cornell-University/arxiv" target="_blank" rel="noreferrer">
            arXiv Dataset
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
