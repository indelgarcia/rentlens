"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResultsPanel from "@/app/components/ResultsPanel";
import type { EvaluateResponse } from "@/app/lib/api";

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <ResultsPanel data={data} />
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
