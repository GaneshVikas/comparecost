const WB_BASE = 'https://api.worldbank.org/v2';

async function fetchIndicator(countryCode, indicator) {
  try {
    const res = await fetch(
      `${WB_BASE}/country/${countryCode}/indicator/${indicator}?format=json&mrv=1&per_page=1`
    );
    const data = await res.json();
    if (data && data[1] && data[1][0]) {
      return data[1][0].value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');

  if (!country) {
    return Response.json({ error: 'Country code required' }, { status: 400 });
  }

  const [gdp, inflation, unemployment] = await Promise.all([
    fetchIndicator(country, 'NY.GDP.PCAP.CD'),
    fetchIndicator(country, 'FP.CPI.TOTL.ZG'),
    fetchIndicator(country, 'SL.UEM.TOTL.ZS'),
  ]);

  return Response.json({ gdp, inflation, unemployment });
}
