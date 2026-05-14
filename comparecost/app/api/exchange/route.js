export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get('base') || 'USD';

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${base}`
    );
    const data = await res.json();

    if (data.result !== 'success') {
      return Response.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }

    return Response.json({ rates: data.conversion_rates, base });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
