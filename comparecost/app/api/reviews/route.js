import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');

  let query = supabase
    .from('reviews')
    .select('*')
    .eq('reported', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (country) query = query.eq('country_code', country);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ reviews: data });
}

export async function POST(req) {
  const body = await req.json();
  const { country_code, country_name, rating, review_text, tips, is_student, author_name } = body;

  if (!country_code || !rating || !review_text) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const profanityWords = ['spam', 'scam'];
  const lowerText = review_text.toLowerCase();
  for (const word of profanityWords) {
    if (lowerText.includes(word)) {
      return Response.json({ error: 'Review contains inappropriate content' }, { status: 400 });
    }
  }

  const { data, error } = await supabase.from('reviews').insert([{
    country_code,
    country_name,
    rating,
    review_text,
    tips: tips || [],
    is_student: is_student || false,
    author_name: author_name || 'Anonymous',
    upvotes: 0,
    reported: false,
  }]).select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ review: data[0] });
}
