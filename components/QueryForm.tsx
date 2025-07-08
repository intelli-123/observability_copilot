// Component: components/QueryForm.tsx
"use client";
import React, { useState } from "react";

export default function QueryForm() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    const res = await fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <textarea
        className="border w-full p-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter log query"
      />
      <button className="mt-2 p-2 bg-blue-500 text-white" onClick={handleSubmit}>
        Run Query
      </button>

      {result && (
        <div className="mt-4">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
