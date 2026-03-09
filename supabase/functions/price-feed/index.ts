import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const seed = daySeed();
    const hour = new Date().getHours();

    // BTC price with daily drift
    const baseBTC = 67_342 + Math.floor(seededRandom(seed) * 2000 - 1000);
    const hourDrift = Math.sin(hour / 24 * Math.PI * 2) * 500;
    const btcPrice = Math.round(baseBTC + hourDrift);
    const btc24hChange = ((seededRandom(seed + 50) - 0.45) * 6).toFixed(2);

    // strkBTC usually trades at slight premium/discount
    const strkBTCRatio = 0.998 + seededRandom(seed + 60) * 0.004;
    const strkBTCPrice = Math.round(btcPrice * strkBTCRatio);

    // ETH price
    const baseETH = 3_842 + Math.floor(seededRandom(seed + 70) * 200 - 100);
    const ethPrice = Math.round(baseETH + hourDrift * 0.05);

    // STRK price
    const baseSTRK = 1.24 + (seededRandom(seed + 80) - 0.5) * 0.3;
    const strkPrice = parseFloat(baseSTRK.toFixed(4));

    // 7-day price history for sparkline
    const priceHistory = Array.from({ length: 168 }, (_, i) => {
      const daySeed2 = seed - Math.floor((167 - i) / 24);
      const base = 67_342 + Math.floor(seededRandom(daySeed2) * 2000 - 1000);
      const hourVar = Math.sin(((167 - i) % 24) / 24 * Math.PI * 2) * 500;
      return Math.round(base + hourVar + (seededRandom(seed * 1000 + i) - 0.5) * 300);
    });

    // Gas tracker
    const gasLow = (0.5 + seededRandom(seed + 90) * 0.3).toFixed(2);
    const gasMed = (0.8 + seededRandom(seed + 91) * 0.4).toFixed(2);
    const gasHigh = (1.2 + seededRandom(seed + 92) * 0.6).toFixed(2);

    const feed = {
      btc: { price: btcPrice, change24h: parseFloat(btc24hChange), symbol: "BTC" },
      strkBTC: { price: strkBTCPrice, ratio: parseFloat(strkBTCRatio.toFixed(4)), symbol: "strkBTC" },
      eth: { price: ethPrice, symbol: "ETH" },
      strk: { price: strkPrice, symbol: "STRK" },
      priceHistory,
      gas: { low: parseFloat(gasLow), medium: parseFloat(gasMed), high: parseFloat(gasHigh), unit: "gwei" },
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(feed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
