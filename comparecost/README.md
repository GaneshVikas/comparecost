# CompareCost

Cost of living comparison tool for students and expats.

## Stack
- **Frontend**: Next.js 14 → Vercel
- **Database**: Supabase (reviews storage)
- **APIs**: ExchangeRate API, World Bank API (free)

## Setup

### 1. Supabase
Run `supabase_setup.sql` in your Supabase SQL Editor.

### 2. Environment Variables (in Vercel dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
```

### 3. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect to Vercel via dashboard.

## Local Development
```bash
# Create .env.local with your keys
cp .env.example .env.local
npm install
npm run dev
```

## Features
- Interactive world map — click to select countries
- 50+ cost of living data points per country
- Real-time currency conversion
- Purchasing power comparison bar
- Housing & job links per country
- Student reviews with colorful cards
- Report button on reviews
- 10 countries with static data (more via Numbeo API)
