"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScoreCard from "@/app/components/ScoreCard";
import type { EvaluateResponse, CommuteEntry } from "@/app/lib/api";

function formatMarketScore(score_pct: number): { display: string; color: "green" | "yellow" | "red" } {
  const abs = Math.abs(score_pct).toFixed(1);
  if (score_pct < -5) return { display: `${abs}% below market`, color: "green" };
  if (score_pct > 5)  return { display: `${abs}% above market`, color: "red" };
  return { display: "At market value", color: "yellow" };
}

function CommuteCard({ entry }: { entry: CommuteEntry }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {entry.label}
      </p>
      <p className="text-sm text-gray-500 mb-3 truncate">{entry.address}</p>
      <div className="flex gap-6">
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {entry.transit_time ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">by transit</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {entry.walking_time ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">walking</p>
        </div>
        {entry.distance_miles != null && (
          <div>
            <p className="text-2xl font-bold text-gray-800">{entry.distance_miles} mi</p>
            <p className="text-xs text-gray-500 mt-0.5">distance</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<EvaluateResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rentlens_result");
    if (!raw) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(raw) as EvaluateResponse);
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  const mv = formatMarketScore(data.market_value.score_pct);

  const safetyFootnote = [
    `${data.safety.details.felonies} felonies · ${data.safety.details.misdemeanors} misdemeanors · ${data.safety.details.violations} violations`,
    `within ${data.safety.details.radius_meters / 1000}km · ${data.safety.details.data_period}`,
  ].join(" — ");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Evaluation results
          </p>
          <h1 className="text-xl font-bold text-gray-900">{data.address}</h1>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreCard
            title="Market Value"
            score={mv.display}
            label={`$${data.market_value.user_rent.toLocaleString()}/mo asking · $${data.market_value.fmr.toLocaleString()}/mo FMR`}
            color={mv.color}
            footnote={data.market_value.comparison_basis}
          />
          <ScoreCard
            title="Safety Score"
            score={`${data.safety.score}/100`}
            label={data.safety.label}
            color={data.safety.color as "green" | "yellow" | "red"}
            footnote={safetyFootnote}
          />
        </div>

        {/* Commutes */}
        {data.commutes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Commutes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.commutes.map((entry, i) => (
                <CommuteCard key={i} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
        >
          ← Evaluate another listing
        </Link>
      </div>
    </div>
  );
}
