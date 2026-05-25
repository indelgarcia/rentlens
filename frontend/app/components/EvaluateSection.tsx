"use client";

import { useState, useRef, useEffect } from "react";
import EvaluateForm from "@/app/components/EvaluateForm";
import ResultsPanel from "@/app/components/ResultsPanel";
import type { EvaluateResponse } from "@/app/lib/api";

export default function EvaluateSection() {
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to results whenever a new result arrives
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <div className="space-y-8">
      <EvaluateForm onResult={setResult} />

      {result && (
        <div ref={resultRef} className="border-t border-gray-200 pt-8">
          <ResultsPanel data={result} />
        </div>
      )}
    </div>
  );
}
