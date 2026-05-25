import ScoreCard from "@/app/components/ScoreCard";
import type { EvaluateResponse, CommuteEntry } from "@/app/lib/api";

function formatMarketScore(score_pct: number): {
  display: string;
  color: "green" | "yellow" | "red";
} {
  const abs = Math.abs(score_pct).toFixed(1);
  if (score_pct < -5) return { display: `${abs}% below HUD benchmark`, color: "green" };
  if (score_pct > 5) return { display: `${abs}% above HUD benchmark`, color: "red" };
  return { display: "At HUD benchmark", color: "yellow" };
}

function CommuteCard({ entry, index }: { entry: CommuteEntry; index: number }) {
  const displayLabel = entry.label.trim() || `Destination ${index + 1}`;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {displayLabel}
      </p>
      <p className="text-sm text-gray-500 mb-3 truncate">{entry.address}</p>
      <div className="flex gap-6">
        <div>
          <p className="text-2xl font-bold text-gray-800">{entry.transit_time ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">by public transit</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{entry.walking_time ?? "—"}</p>
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

interface ResultsPanelProps {
  data: EvaluateResponse;
}

export default function ResultsPanel({ data }: ResultsPanelProps) {
  const mv = formatMarketScore(data.market_value.score_pct);

  const safetyFootnote = [
    `${data.safety.details.felonies} felonies · ${data.safety.details.misdemeanors} misdemeanors · ${data.safety.details.violations} violations`,
    `within ${data.safety.details.radius_meters / 1000}km · ${data.safety.details.data_period}`,
  ].join(" — ");

  return (
    <div className="space-y-6">
      {/* Address header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Evaluation results
        </p>
        <h2 className="text-xl font-bold text-gray-900">{data.address}</h2>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <ScoreCard
            title="Market Value"
            score={mv.display}
            label={`$${data.market_value.user_rent.toLocaleString()}/mo asking · $${data.market_value.fmr.toLocaleString()}/mo FMR`}
            color={mv.color}
            footnote={data.market_value.comparison_basis}
          />
          <p className="text-xs text-gray-400 mt-2 px-1">
            HUD FMR is a federal affordability floor (40th percentile), not a market average.
            Most Zillow listings price above this benchmark.
          </p>
        </div>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Commutes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.commutes.map((entry, i) => (
              <CommuteCard key={entry.label || entry.address} entry={entry} index={i} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Showing fastest public transit route. Other routes may be available via Google Maps.
          </p>
        </div>
      )}
    </div>
  );
}
