type Color = "green" | "yellow" | "red";

const colorClasses: Record<Color, string> = {
  green: "border-green-200 bg-green-50 text-green-800",
  yellow: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

const scoreColorClasses: Record<Color, string> = {
  green: "text-green-700",
  yellow: "text-amber-700",
  red: "text-red-700",
};

interface ScoreCardProps {
  title: string;
  score: string;
  label: string;
  color: Color;
  footnote?: string;
}

export default function ScoreCard({ title, score, label, color, footnote }: ScoreCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">{title}</p>
      <p className={`text-4xl font-bold mb-1 ${scoreColorClasses[color]}`}>{score}</p>
      <p className="text-sm font-medium">{label}</p>
      {footnote && <p className="text-xs mt-2 opacity-60">{footnote}</p>}
    </div>
  );
}
