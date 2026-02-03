import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateBadgeSvg(directoryName: string): string {
  // Calculate ribbon width based on text length
  const charWidth = 7;
  const padding = 20;
  const minWidth = 60;
  const ribbonWidth = Math.max(
    minWidth,
    directoryName.length * charWidth + padding
  );
  const ribbonX = 100 - ribbonWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a4d8f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d2847;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f4d03f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c9a832;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" />
    </filter>
  </defs>

  <path
    d="M100 10 L170 35 L170 100 Q170 160 100 210 Q30 160 30 100 L30 35 Z"
    fill="url(#shieldGradient)"
    stroke="#0a1f3d"
    stroke-width="2"
    filter="url(#shadow)"
  />

  <path
    d="M100 25 L155 45 L155 100 Q155 150 100 190 Q45 150 45 100 L45 45 Z"
    fill="none"
    stroke="#2a6bb5"
    stroke-width="1.5"
    opacity="0.4"
  />

  <circle cx="100" cy="90" r="35" fill="#fff" opacity="0.95" />
  <circle
    cx="100"
    cy="90"
    r="32"
    fill="none"
    stroke="url(#ribbonGradient)"
    stroke-width="3"
  />

  <path
    d="M85 90 L95 100 L115 78"
    fill="none"
    stroke="url(#ribbonGradient)"
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <path
    d="M50 50 L150 50 L145 65 L55 65 Z"
    fill="url(#ribbonGradient)"
    stroke="#a08020"
    stroke-width="1"
  />

  <text
    x="100"
    y="62"
    font-family="Arial, sans-serif"
    font-size="12"
    font-weight="bold"
    fill="#0d2847"
    text-anchor="middle"
    letter-spacing="1"
  >
    PREMIUM
  </text>

  <text
    x="100"
    y="145"
    font-family="Arial, sans-serif"
    font-size="16"
    font-weight="bold"
    fill="#ffffff"
    text-anchor="middle"
    letter-spacing="2"
  >
    MEMBER
  </text>

  <rect
    x="${ribbonX}"
    y="165"
    width="${ribbonWidth}"
    height="28"
    rx="3"
    fill="url(#ribbonGradient)"
    stroke="#a08020"
    stroke-width="1"
  />

  <text
    x="100"
    y="183"
    font-family="Arial, sans-serif"
    font-size="11"
    font-weight="bold"
    fill="#0d2847"
    text-anchor="middle"
    letter-spacing="0.5"
  >
    ${directoryName}
  </text>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Missing badge ID' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch site_business with site info
  const { data: siteBusiness, error } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      plan,
      site:sites!inner(
        id,
        name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !siteBusiness) {
    return NextResponse.json(
      { error: 'Badge not found' },
      { status: 404 }
    );
  }

  // Only show badge for premium members
  if (!siteBusiness.plan) {
    return NextResponse.json(
      { error: 'Premium membership required' },
      { status: 403 }
    );
  }

  const directoryName = siteBusiness.site.name.toUpperCase();
  const svg = generateBadgeSvg(directoryName);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
