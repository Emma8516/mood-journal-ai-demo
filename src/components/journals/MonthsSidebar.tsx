"use client";
export default function MonthsSidebar({
  months, selected, onSelect, onLatest
}:{
  months: string[]; selected: string; onSelect: (m:string)=>void; onLatest: ()=>void;
}) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Months</h2>
        <button onClick={onLatest} className="text-xs text-white/70 hover:text-white/90">Latest</button>
      </div>
      {months.length === 0 ? (
        <p className="text-white/60 text-sm">No month yet</p>
      ) : (
        <ul className="space-y-1">
          {months.map((m) => (
            <li key={m}>
              <button
                onClick={() => onSelect(m)}
                className={[
                  "w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 transition",
                  selected === m ? "bg-white/20 font-semibold" : "",
                ].join(" ")}
              >{m}</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
