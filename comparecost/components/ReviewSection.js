'use client';
import { useState, useEffect } from 'react';

const CARD_COLORS = [
  { bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.25)', tag: 'rgba(108,99,255,0.2)', tagText: '#a5b4fc' },
  { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)', tag: 'rgba(6,182,212,0.2)', tagText: '#67e8f9' },
  { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', tag: 'rgba(34,197,94,0.2)', tagText: '#86efac' },
  { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', tag: 'rgba(249,115,22,0.2)', tagText: '#fdba74' },
  { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', tag: 'rgba(236,72,153,0.2)', tagText: '#f9a8d4' },
];

const TIP_TAGS = ['🏠 Housing', '🚌 Transport', '💰 Budget', '🎓 Student Life', '🍔 Food', '🏥 Healthcare', '💼 Jobs', '🌐 Language', '🤝 Community', '🔒 Safety'];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
          style={{ color: star <= (hover || value) ? '#f59e0b' : '#2a2a3a' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ countryA, countryB }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState(countryA?.code || '');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportedIds, setReportedIds] = useState(new Set());

  const [form, setForm] = useState({
    author_name: '',
    rating: 0,
    review_text: '',
    tips: [],
    is_student: false,
    country_code: activeCountry,
    country_name: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [activeCountry]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?country=${activeCountry}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!form.rating || !form.review_text || form.review_text.length < 20) return;
    setSubmitting(true);

    const countryName = activeCountry === countryA?.code ? countryA?.name : countryB?.name;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, country_code: activeCountry, country_name: countryName }),
      });
      const data = await res.json();
      if (data.review) {
        setReviews(prev => [data.review, ...prev]);
        setSubmitted(true);
        setShowForm(false);
        setForm({ author_name: '', rating: 0, review_text: '', tips: [], is_student: false, country_code: activeCountry, country_name: '' });
      }
    } catch {}
    setSubmitting(false);
  }

  async function handleReport(id) {
    try {
      await fetch('/api/reviews/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setReportedIds(prev => new Set([...prev, id]));
    } catch {}
  }

  function toggleTip(tip) {
    setForm(f => ({
      ...f,
      tips: f.tips.includes(tip) ? f.tips.filter(t => t !== tip) : [...f.tips, tip],
    }));
  }

  const countries = [countryA, countryB].filter(Boolean);

  return (
    <div>
      {/* Country tabs */}
      <div className="flex gap-2 mb-6">
        {countries.map(c => (
          <button
            key={c.code}
            onClick={() => setActiveCountry(c.code)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeCountry === c.code ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : '#12121a',
              color: activeCountry === c.code ? 'white' : '#6b7280',
              border: activeCountry === c.code ? 'none' : '1px solid #2a2a3a',
            }}
          >
            <img src={`https://flagcdn.com/20x15/${c.code.toLowerCase()}.png`} className="rounded-sm" alt="" />
            {c.name}
          </button>
        ))}
      </div>

      {/* Write Review button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Student Reviews & Tips</h3>
          <p className="text-gray-500 text-xs mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''} for {countries.find(c => c.code === activeCountry)?.name}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)' }}
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {submitted && (
        <div className="mb-4 px-4 py-3 rounded-xl text-emerald-400 text-sm"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          ✅ Review submitted! Thanks for helping fellow students.
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl p-6" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
          <h4 className="text-white font-semibold mb-4">Share your experience in {countries.find(c => c.code === activeCountry)?.name}</h4>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Your Name (optional)</label>
              <input
                type="text"
                placeholder="Anonymous"
                value={form.author_name}
                onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                style={{ background: '#1a1a26', border: '1px solid #2a2a3a' }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Overall Rating</label>
              <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Your Review (min 20 characters)</label>
              <textarea
                placeholder="Share your honest experience living here — costs, lifestyle, what surprised you..."
                value={form.review_text}
                onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
                rows={4}
                className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none"
                style={{ background: '#1a1a26', border: '1px solid #2a2a3a' }}
              />
              <p className="text-xs text-gray-600 mt-1">{form.review_text.length} chars</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Quick Tips (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {TIP_TAGS.map(tip => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => toggleTip(tip)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: form.tips.includes(tip) ? 'rgba(108,99,255,0.3)' : '#1a1a26',
                      border: form.tips.includes(tip) ? '1px solid #6c63ff' : '1px solid #2a2a3a',
                      color: form.tips.includes(tip) ? '#a5b4fc' : '#6b7280',
                    }}
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, is_student: !f.is_student }))}
                className="w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{ background: form.is_student ? '#6c63ff' : '#2a2a3a', border: '1px solid #6c63ff' }}
              >
                {form.is_student && <span className="text-white text-xs">✓</span>}
              </button>
              <label className="text-sm text-gray-400 cursor-pointer" onClick={() => setForm(f => ({ ...f, is_student: !f.is_student }))}>
                I am / was a student here 🎓
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.rating || form.review_text.length < 20}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-400 transition-all"
                style={{ background: '#1a1a26', border: '1px solid #2a2a3a' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#12121a', border: '1px dashed #2a2a3a' }}>
          <p className="text-4xl mb-3">🌍</p>
          <p className="text-gray-500 font-medium">No reviews yet for this country</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <div
                key={review.id}
                className="rounded-2xl p-5 card-hover"
                style={{ background: color.bg, border: `1px solid ${color.border}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: color.border, color: color.tagText }}>
                      {(review.author_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{review.author_name || 'Anonymous'}</span>
                        {review.is_student && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: color.tag, color: color.tagText }}>
                            🎓 Student
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} style={{ color: s <= review.rating ? '#f59e0b' : '#2a2a3a', fontSize: '12px' }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {!reportedIds.has(review.id) ? (
                      <button
                        onClick={() => handleReport(review.id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(0,0,0,0.2)' }}
                        title="Report this review"
                      >
                        🚩
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">Reported</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.review_text}</p>

                {review.tips && review.tips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.tips.map(tip => (
                      <span key={tip} className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: color.tag, color: color.tagText }}>
                        {tip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
