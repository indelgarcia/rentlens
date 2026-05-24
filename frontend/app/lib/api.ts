export type POI = { label: string; address: string };

export type EvaluateRequest = {
  address: string;
  bedrooms: number;
  rent: number;
  pois: POI[];
};

export type MarketValueResult = {
  score_pct: number;
  label: string;
  color: string;
  fmr: number;
  user_rent: number;
  comparison_basis: string;
};

export type SafetyDetails = {
  felonies: number;
  misdemeanors: number;
  violations: number;
  radius_meters: number;
  data_period: string;
};

export type SafetyResult = {
  score: number;
  label: string;
  color: string;
  details: SafetyDetails;
};

export type CommuteEntry = {
  label: string;
  address: string;
  transit_time: string | null;
  walking_time: string | null;
  distance_miles: number | null;
};

export type EvaluateResponse = {
  address: string;
  market_value: MarketValueResult;
  safety: SafetyResult;
  commutes: CommuteEntry[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function evaluateListing(data: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch(`${API_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Evaluation failed");
  }
  return res.json() as Promise<EvaluateResponse>;
}
