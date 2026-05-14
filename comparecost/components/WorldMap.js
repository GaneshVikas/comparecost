'use client';
import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO numeric to alpha-2 mapping (common countries)
const NUM_TO_ALPHA2 = {
  4: 'AF', 8: 'AL', 12: 'DZ', 24: 'AO', 32: 'AR', 36: 'AU', 40: 'AT', 50: 'BD',
  56: 'BE', 68: 'BO', 76: 'BR', 100: 'BG', 116: 'KH', 120: 'CM', 124: 'CA',
  144: 'LK', 152: 'CL', 156: 'CN', 170: 'CO', 180: 'CD', 191: 'HR', 192: 'CU',
  196: 'CY', 203: 'CZ', 208: 'DK', 214: 'DO', 218: 'EC', 818: 'EG', 231: 'ET',
  246: 'FI', 250: 'FR', 276: 'DE', 288: 'GH', 300: 'GR', 320: 'GT', 332: 'HT',
  340: 'HN', 348: 'HU', 356: 'IN', 360: 'ID', 364: 'IR', 368: 'IQ', 372: 'IE',
  376: 'IL', 380: 'IT', 388: 'JM', 392: 'JP', 400: 'JO', 398: 'KZ', 404: 'KE',
  410: 'KR', 408: 'KP', 414: 'KW', 418: 'LA', 422: 'LB', 434: 'LY', 440: 'LT',
  442: 'LU', 450: 'MG', 458: 'MY', 484: 'MX', 504: 'MA', 508: 'MZ', 516: 'NA',
  524: 'NP', 528: 'NL', 554: 'NZ', 558: 'NI', 566: 'NG', 578: 'NO', 586: 'PK',
  591: 'PA', 598: 'PG', 600: 'PY', 604: 'PE', 608: 'PH', 616: 'PL', 620: 'PT',
  630: 'PR', 634: 'QA', 642: 'RO', 643: 'RU', 682: 'SA', 686: 'SN', 694: 'SL',
  703: 'SK', 705: 'SI', 706: 'SO', 710: 'ZA', 724: 'ES', 144: 'LK', 729: 'SD',
  752: 'SE', 756: 'CH', 760: 'SY', 158: 'TW', 762: 'TJ', 764: 'TH', 768: 'TG',
  788: 'TN', 792: 'TR', 800: 'UG', 804: 'UA', 784: 'AE', 826: 'GB', 840: 'US',
  858: 'UY', 860: 'UZ', 862: 'VE', 704: 'VN', 887: 'YE', 894: 'ZM', 716: 'ZW',
  232: 'ER', 233: 'EE', 266: 'GA', 422: 'LB', 426: 'LS', 430: 'LR', 428: 'LV',
  454: 'MW', 466: 'ML', 478: 'MR', 496: 'MN', 807: 'MK', 70: 'BA', 100: 'BG',
  64: 'BT', 72: 'BW', 96: 'BN', 178: 'CG', 188: 'CR', 174: 'KM',
};

const COUNTRY_NAMES = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AO: 'Angola', AR: 'Argentina',
  AU: 'Australia', AT: 'Austria', BD: 'Bangladesh', BE: 'Belgium', BO: 'Bolivia',
  BR: 'Brazil', BG: 'Bulgaria', CA: 'Canada', CL: 'Chile', CN: 'China',
  CO: 'Colombia', HR: 'Croatia', CZ: 'Czech Republic', DK: 'Denmark',
  EG: 'Egypt', ET: 'Ethiopia', FI: 'Finland', FR: 'France', DE: 'Germany',
  GH: 'Ghana', GR: 'Greece', HU: 'Hungary', IN: 'India', ID: 'Indonesia',
  IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IL: 'Israel', IT: 'Italy',
  JP: 'Japan', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KR: 'South Korea',
  KW: 'Kuwait', LY: 'Libya', MY: 'Malaysia', MX: 'Mexico', MA: 'Morocco',
  NP: 'Nepal', NL: 'Netherlands', NZ: 'New Zealand', NG: 'Nigeria',
  NO: 'Norway', PK: 'Pakistan', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', RU: 'Russia', SA: 'Saudi Arabia',
  SK: 'Slovakia', ZA: 'South Africa', ES: 'Spain', SE: 'Sweden', CH: 'Switzerland',
  TW: 'Taiwan', TH: 'Thailand', TN: 'Tunisia', TR: 'Turkey', UA: 'Ukraine',
  AE: 'UAE', GB: 'United Kingdom', US: 'United States', UY: 'Uruguay',
  UZ: 'Uzbekistan', VE: 'Venezuela', VN: 'Vietnam', YE: 'Yemen', ZM: 'Zambia',
  ZW: 'Zimbabwe', SI: 'Slovenia', MK: 'North Macedonia', RS: 'Serbia',
  BA: 'Bosnia', ME: 'Montenegro', AL: 'Albania', LT: 'Lithuania', LV: 'Latvia',
  EE: 'Estonia', LU: 'Luxembourg', CY: 'Cyprus', MT: 'Malta',
};

export default function WorldMap({ onCountrySelect, selectedA, selectedB, selectingFor }) {
  const [tooltip, setTooltip] = useState(null);

  function getCountryCode(geo) {
    const numId = parseInt(geo.id);
    return NUM_TO_ALPHA2[numId] || null;
  }

  function getFill(code) {
    if (code === selectedA && code === selectedB) return '#f59e0b';
    if (code === selectedA) return '#6c63ff';
    if (code === selectedB) return '#a855f7';
    return '#1e1e32';
  }

  return (
    <div className="relative w-full h-full">
      {tooltip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg text-xs text-white pointer-events-none"
          style={{ background: 'rgba(108,99,255,0.9)', border: '1px solid rgba(108,99,255,0.5)' }}>
          {tooltip}
        </div>
      )}
      <ComposableMap
        projectionConfig={{ scale: 145, center: [0, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const code = getCountryCode(geo);
                const name = code ? (COUNTRY_NAMES[code] || code) : null;
                const fill = code ? getFill(code) : '#1a1a2e';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#0a0a0f"
                    strokeWidth={0.5}
                    style={{
                      default: { fill, outline: 'none' },
                      hover: { fill: code ? (selectingFor === 'A' ? '#8b85ff' : '#c084fc') : '#252540', outline: 'none', cursor: code ? 'pointer' : 'default' },
                      pressed: { fill: '#6c63ff', outline: 'none' },
                    }}
                    onMouseEnter={() => name && setTooltip(name)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (code && name) onCountrySelect(code, name);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 text-xs">
        {selectedA && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: '#6c63ff' }} />
            <span className="text-gray-300">Home</span>
          </div>
        )}
        {selectedB && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: '#a855f7' }} />
            <span className="text-gray-300">Destination</span>
          </div>
        )}
      </div>
    </div>
  );
}
