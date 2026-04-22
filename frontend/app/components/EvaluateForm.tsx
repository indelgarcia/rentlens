"use client";

import { useState } from "react";

type POI = { label: string; address: string };

type FormData = {
  address: string;
  bedrooms: string;
  rent: string;
  pois: POI[];
};

const MAX_POIS = 3;

export default function EvaluateForm() {
  const [form, setForm] = useState<FormData>({
    address: "",
    bedrooms: "1",
    rent: "",
    pois: [{ label: "", address: "" }],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submitting:", form);
    // TODO: wire up to backend /api/evaluate in Phase 2
  }

  function updatePOI(index: number, field: keyof POI, value: string) {
    setForm((prev) => ({
      ...prev,
      pois: prev.pois.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  function addPOI() {
    setForm((prev) => ({
      ...prev,
      pois: [...prev.pois, { label: "", address: "" }],
    }));
  }

  function removePOI(index: number) {
    setForm((prev) => ({
      ...prev,
      pois: prev.pois.filter((_, i) => i !== index),
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
    >
      {/* Listing address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Listing address
        </label>
        <input
          type="text"
          required
          placeholder="123 Main St, Brooklyn, NY 11201"
          value={form.address}
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bedrooms + Rent */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <select
            value={form.bedrooms}
            onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">Studio / 0BR</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asking rent ($/mo)
          </label>
          <input
            type="number"
            required
            min={0}
            placeholder="2500"
            value={form.rent}
            onChange={(e) => setForm((prev) => ({ ...prev, rent: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* POI destinations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key destinations (commute check)
        </label>
        <div className="space-y-2">
          {form.pois.map((poi, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Label (e.g. Work)"
                value={poi.label}
                onChange={(e) => updatePOI(i, "label", e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={poi.address}
                onChange={(e) => updatePOI(i, "address", e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.pois.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePOI(i)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none px-1"
                  aria-label="Remove destination"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {form.pois.length < MAX_POIS && (
          <button
            type="button"
            onClick={addPOI}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add destination
          </button>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Evaluate listing
      </button>
    </form>
  );
}
