import React, { useState, useMemo } from "react";
import { suppliersData, regions } from "./data";

export default function SuppliersScreen() {
  const [region, setRegion] = useState("הכל");

  const filtered = useMemo(() => {
    return suppliersData.filter((s) => region === "הכל" || s.region === region);
  }, [region]);

  return (
    <div>
      <h2>ספקים</h2>

      {regions.map((r) => (
        <button key={r} onClick={() => setRegion(r)}>
          {r}
        </button>
      ))}

      {filtered.map((s) => (
        <div key={s.id}>
          <h3>{s.name}</h3>
          <p>
            {s.category} · {s.city}
          </p>
          <p>⭐ {s.score}</p>
        </div>
      ))}
    </div>
  );
}
