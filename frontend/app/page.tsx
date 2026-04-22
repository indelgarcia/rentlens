import EvaluateForm from "./components/EvaluateForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">RentLens</h1>
        <p className="text-sm text-gray-500">NYC apartment evaluator</p>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Is this apartment worth it?
          </h2>
          <p className="text-gray-600">
            Enter a listing and we&apos;ll score it on market value, neighborhood
            safety, and commute time to your key destinations.
          </p>
        </div>

        <EvaluateForm />
      </section>
    </main>
  );
}
