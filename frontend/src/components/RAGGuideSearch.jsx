import React, { useState } from 'react';
import { Search, BookOpen, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { ragAPI } from '../services/api';

export default function RAGGuideSearch({ destination = "Ahmedabad" }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "Is this destination good for a family trip?",
    "What are the culinary specialties & best vegetarian dishes?",
    "How to navigate local transportation and metro?",
    "What are the best seasons and festival months to visit?"
  ];

  const handleSearch = async (qText = null) => {
    const q = qText || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    try {
      const res = await ragAPI.queryGuide(destination, q);
      setResult(res.data);
    } catch (err) {
      console.warn('RAG search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-5">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            RAG Knowledge Base
          </span>
          <h3 className="text-base font-bold text-slate-900">Destination Intelligence & Travel Guide</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Vector search over verified destination guides, local heritage tips, food guides, and safety protocols for {destination}.
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask anything about ${destination} (e.g. "Is it safe for solo or family travel?")`}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-smooth disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Ask AI'}
        </button>
      </form>

      {/* Preset Question Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400">Try asking:</span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sq);
              handleSearch(sq);
            }}
            className="text-[11px] font-medium text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 px-2.5 py-1 rounded-full border border-slate-200 transition-smooth"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Answer Result Display */}
      {result && (
        <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-200/80 space-y-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Verified Travel Answer</span>
          </div>

          <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-lg border border-brand-100 shadow-subtle">
            {result.answer}
          </div>

          {/* Sources retrieved via Vector Search */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Retrieved Vector Sources ({result.sources.length} Documents)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((src, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="truncate">{src.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round(src.relevance_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 line-clamp-2">{src.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
