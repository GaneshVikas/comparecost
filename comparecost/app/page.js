'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CURRENCIES, CATEGORIES } from '../lib/data';
import { getCountryData, convertPrice, formatPrice } from '../lib/costs';
import { COUNTRY_HOUSING_LINKS, COUNTRY_JOB_LINKS } from '../lib/data';
import ReviewSection from '../components/ReviewSection';

const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });

const CATEGORY_EMOJIS = {
  food: '🛒', housing: '🏠', transport: '🚌', lifestyle: '🎬', salaries: '💼', economy: '📊', childcare: '📚'
};

const REVIEW_COLORS = [
  'from-violet-500/20 to-purple-600/20 border-violet-500/30',
  'from-cyan-500/20 to-blue-600/20 border-cyan-500/30',
  'from-emerald-500/20 to-teal-600/20 border-emerald-500/30',
  'from-orange-500/20 to-amber-600/20 border-orange-500/30',
  'from-rose-500/20 to-pink-600/20 border-rose-500/30',
];

export default function Home() {
  const [step, setStep] = useState('map'); // map | results
  const [selectingFor, setSelectingFor] = useState('A'); // A or B
  const [countryA, setCountryA] = useState(null);
  const [countryB, setCountryB] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [activeTab, setActiveTab] = useState('compare');
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`/api/exchange?base=USD`)
      .then(r => r.json())
      .then(d => setExchangeRates(d.rates));
  }, []);

  function handleCountrySelect(code, name) {
    if (selectingFor === 'A') {
      setCountryA({ code, name });
      setSearchA(name);
      setSelectingFor('B');
    } else {
      setCountryB({ code, name });
      setSearchB(name);
    }
  }

  function handleCompare() {
    if (!countryA || !countryB) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('results');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);
  }

  const dataA = countryA ? getCountryData(countryA.code) : null;
  const dataB = countryB ? getCountryData(countryB.code) : null;

  function getConverted(data, key) {
    if (!data) return null;
    const val = data[key];
    if (val === undefined) return null;
    return convertPrice(val, exchangeRates, currency);
  }

  function getDiff(valA, valB) {
    if (!valA || !valB) return null;
    const pct = ((valB - valA) / valA) * 100;
    return pct;
  }

  const housingLinksA = countryA ? (COUNTRY_HOUSING_LINKS[countryA.code] || []) : [];
  const housingLinksB = countryB ? (COUNTRY_HOUSING_LINKS[countryB.code] || []) : [];
  const jobLinksA = countryA ? (COUNTRY_JOB_LINKS[countryA.code] || COUNTRY_JOB_LINKS.DEFAULT) : [];
  const jobLinksB = countryB ? (COUNTRY_JOB_LINKS[countryB.code] || COUNTRY_JOB_LINKS.DEFAULT) : [];

  const avgPowerA = dataA ? ['meal_cheap', 'apt_1br_outside', 'transport_pass', 'avg_salary'].reduce((acc, k) => acc + (getConverted(dataA, k) || 0), 0) / 4 : 0;
  const avgPowerB = dataB ? ['meal_cheap', 'apt_1br_outside', 'transport_pass', 'avg_salary'].reduce((acc, k) => acc + (getConverted(dataB, k) || 0), 0) / 4 : 0;

  return (
    <main className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-black"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)' }}>
              <span className="text-white text-sm font-black">CC</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CompareCost</span>
            <span className="text-xs px-2 py-0.5 rounded-full text-purple-300" style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
              live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="text-sm rounded-lg px-3 py-1.5 text-white outline-none"
              style={{ background: '#1a1a26', border: '1px solid #2a2a3a' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-purple-300 px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)' }}>
          🌍 Cost of Living · Real Data · Student Friendly
        </div>
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          How far does your<br />
          <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            money actually go?
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Compare cost of living, salaries, and economy between any two countries. Built for students, expats, and curious minds.
        </p>
      </section>

      {/* COUNTRY SELECTOR */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="rounded-2xl p-6" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Country A */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block uppercase tracking-widest">Home Country</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type or click map below..."
                  value={searchA}
                  onChange={e => {
                    setSearchA(e.target.value);
                    setSelectingFor('A');
                  }}
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm"
                  style={{ background: '#1a1a26', border: selectingFor === 'A' ? '1px solid #6c63ff' : '1px solid #2a2a3a' }}
                  onFocus={() => setSelectingFor('A')}
                />
                {countryA && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <img src={`https://flagcdn.com/24x18/${countryA.code.toLowerCase()}.png`} className="rounded-sm" alt="" />
                    <span className="text-xs text-purple-400">{countryA.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Country B */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block uppercase tracking-widest">Destination Country</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type or click map below..."
                  value={searchB}
                  onChange={e => {
                    setSearchB(e.target.value);
                    setSelectingFor('B');
                  }}
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm"
                  style={{ background: '#1a1a26', border: selectingFor === 'B' ? '1px solid #a855f7' : '1px solid #2a2a3a' }}
                  onFocus={() => setSelectingFor('B')}
                />
                {countryB && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <img src={`https://flagcdn.com/24x18/${countryB.code.toLowerCase()}.png`} className="rounded-sm" alt="" />
                    <span className="text-xs text-purple-400">{countryB.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selecting indicator */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              {!countryA ? '👆 Click map to select Home Country' : !countryB ? '👆 Click map to select Destination Country' : '✅ Both countries selected — ready to compare!'}
            </p>
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${selectingFor === 'A' ? 'text-white' : 'text-gray-500'}`}
                style={{ background: selectingFor === 'A' ? 'rgba(108,99,255,0.3)' : 'transparent', border: selectingFor === 'A' ? '1px solid #6c63ff' : '1px solid transparent' }}>
                Selecting: Home
              </span>
              <span className={`px-2 py-1 rounded-full ${selectingFor === 'B' ? 'text-white' : 'text-gray-500'}`}
                style={{ background: selectingFor === 'B' ? 'rgba(168,85,247,0.3)' : 'transparent', border: selectingFor === 'B' ? '1px solid #a855f7' : '1px solid transparent' }}>
                Selecting: Destination
              </span>
            </div>
          </div>

          {/* MAP */}
          <div className="rounded-xl overflow-hidden" style={{ height: '380px', background: '#0d0d18' }}>
            <WorldMap
              onCountrySelect={handleCountrySelect}
              selectedA={countryA?.code}
              selectedB={countryB?.code}
              selectingFor={selectingFor}
            />
          </div>

          {/* Compare Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCompare}
              disabled={!countryA || !countryB || loading}
              className="px-10 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: (!countryA || !countryB) ? '#2a2a3a' : 'linear-gradient(135deg, #6c63ff, #a855f7)',
                boxShadow: (!countryA || !countryB) ? 'none' : '0 0 30px rgba(108,99,255,0.4)',
              }}
            >
              {loading ? '⏳ Comparing...' : '⚡ Compare Now'}
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {step === 'results' && dataA && dataB && (
        <section ref={resultsRef} className="max-w-6xl mx-auto px-6 pb-20 animate-fade-up">

          {/* Country header cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[{ data: dataA, country: countryA, color: '#6c63ff' }, { data: dataB, country: countryB, color: '#a855f7' }].map(({ data, country, color }) => (
              <div key={country.code} className="rounded-2xl p-5 text-center" style={{ background: '#12121a', border: `1px solid ${color}40` }}>
                <img src={`https://flagcdn.com/48x36/${country.code.toLowerCase()}.png`} className="mx-auto mb-3 rounded" alt="" />
                <h3 className="text-white font-bold text-lg">{country.name}</h3>
                <p className="text-gray-500 text-xs mt-1">Local currency: {data.currency}</p>
              </div>
            ))}
          </div>

          {/* Purchasing power bar */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
            <h3 className="text-white font-semibold mb-4 text-sm">💡 Purchasing Power Overview</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 w-24 text-right">{countryA.name}</span>
              <div className="flex-1 h-3 rounded-full" style={{ background: '#1a1a26' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, (avgPowerA / Math.max(avgPowerA, avgPowerB)) * 100)}%`,
                  background: 'linear-gradient(90deg, #6c63ff, #8b85ff)',
                  transition: 'width 1s ease',
                }} />
              </div>
              <span className="text-xs text-purple-400 font-mono w-24">{formatPrice(avgPowerA, currency)}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-gray-400 w-24 text-right">{countryB.name}</span>
              <div className="flex-1 h-3 rounded-full" style={{ background: '#1a1a26' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, (avgPowerB / Math.max(avgPowerA, avgPowerB)) * 100)}%`,
                  background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                  transition: 'width 1s ease',
                }} />
              </div>
              <span className="text-xs text-purple-400 font-mono w-24">{formatPrice(avgPowerB, currency)}</span>
            </div>
            <p className="text-xs text-gray-600 mt-3">* Based on avg meal, rent, transport and salary</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {['compare', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : '#12121a',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  border: activeTab === tab ? 'none' : '1px solid #2a2a3a',
                }}
              >
                {tab === 'compare' ? '📊 Comparison' : '💬 Reviews & Tips'}
              </button>
            ))}
          </div>

          {activeTab === 'compare' && (
            <div className="space-y-6">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
                  {/* Category header */}
                  <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #2a2a3a' }}>
                    <span className="text-2xl">{cat.emoji}</span>
                    <h3 className="text-white font-bold">{cat.label}</h3>
                  </div>

                  {/* Items */}
                  <div className="divide-y" style={{ borderColor: '#1e1e2e' }}>
                    {cat.items.map(item => {
                      const valA = getConverted(dataA, item.key);
                      const valB = getConverted(dataB, item.key);
                      const diff = getDiff(valA, valB);
                      const aIsCheaper = valA !== null && valB !== null && valA <= valB;

                      return (
                        <div key={item.key} className="px-6 py-3 grid grid-cols-3 items-center gap-4 hover:bg-white/2 transition-colors">
                          <span className="text-gray-400 text-sm">{item.label}</span>
                          <div className="text-center">
                            <span className={`font-mono text-sm font-semibold ${aIsCheaper ? 'text-emerald-400' : 'text-white'}`}>
                              {formatPrice(valA, currency)}{item.unit}
                            </span>
                          </div>
                          <div className="text-center flex items-center justify-center gap-2">
                            <span className={`font-mono text-sm font-semibold ${!aIsCheaper ? 'text-emerald-400' : 'text-white'}`}>
                              {formatPrice(valB, currency)}{item.unit}
                            </span>
                            {diff !== null && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${diff > 0 ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Column labels inside category */}
                  <div className="px-6 py-2 grid grid-cols-3 gap-4" style={{ borderTop: '1px solid #1e1e2e', background: '#0f0f1a' }}>
                    <span className="text-xs text-gray-600">Item</span>
                    <span className="text-xs text-center" style={{ color: '#8b85ff' }}>{countryA.name}</span>
                    <span className="text-xs text-center" style={{ color: '#c084fc' }}>{countryB.name}</span>
                  </div>

                  {/* Housing links */}
                  {cat.hasLinks && (housingLinksA.length > 0 || housingLinksB.length > 0) && (
                    <div className="px-6 py-4 grid grid-cols-2 gap-6" style={{ borderTop: '1px solid #2a2a3a', background: '#0f0f1a' }}>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Find housing in {countryA.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {housingLinksA.length > 0 ? housingLinksA.map(l => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-lg text-purple-300 transition-colors"
                              style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)' }}>
                              🔗 {l.label}
                            </a>
                          )) : <span className="text-xs text-gray-600">No listings available</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Find housing in {countryB.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {housingLinksB.length > 0 ? housingLinksB.map(l => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-lg text-purple-300 transition-colors"
                              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
                              🔗 {l.label}
                            </a>
                          )) : <span className="text-xs text-gray-600">No listings available</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job links */}
                  {cat.hasJobLinks && (
                    <div className="px-6 py-4 grid grid-cols-2 gap-6" style={{ borderTop: '1px solid #2a2a3a', background: '#0f0f1a' }}>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Find jobs in {countryA.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {jobLinksA.map(l => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-lg text-purple-300 transition-colors"
                              style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)' }}>
                              🔗 {l.label}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Find jobs in {countryB.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {jobLinksB.map(l => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-lg text-purple-300 transition-colors"
                              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
                              🔗 {l.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewSection countryA={countryA} countryB={countryB} />
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-600 text-xs" style={{ borderTop: '1px solid #1a1a26' }}>
        <p>CompareCost · Data from Numbeo, World Bank & ExchangeRate API · For informational purposes only</p>
        <p className="mt-1">Built for students & expats 🌍</p>
      </footer>
    </main>
  );
}
