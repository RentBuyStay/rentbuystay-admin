"use client";

import { useState } from "react";
import { MODULES, PERMISSIONS, type PermMatrix } from "@/lib/demoRoles";

export default function RolePermissions({ initial }: { initial: PermMatrix }) {
  const [state, setState] = useState<PermMatrix>(() => Object.fromEntries(MODULES.map((m) => [m, [...(initial[m] ?? [false, false, false, false])]])));
  const toggle = (m: string, i: number) => setState((s) => ({ ...s, [m]: s[m].map((v, j) => (j === i ? !v : v)) }));

  return (
    <div className="flex flex-col gap-4">
      {MODULES.map((m) => (
        <div key={m} className="flex flex-col gap-2.5" style={{ background: "#F6F6F6", borderRadius: 15, padding: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", color: "#121212" }}>{m}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PERMISSIONS.map((p, i) => (
              <div key={p} className="flex items-center justify-between bg-white" style={{ height: 48, borderRadius: 10, padding: "0 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: "#121212" }}>{p}</span>
                <Toggle on={state[m][i]} onChange={() => toggle(m, i)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="relative shrink-0"
      style={{ width: 40, height: 20, borderRadius: 9999, background: on ? "#FFAE00" : "#F6F6F6", border: on ? "none" : "1px solid #EDEDED", transition: "background 0.15s" }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ width: 14, height: 14, left: on ? 23 : 3, boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left 0.15s" }}
      />
    </button>
  );
}
