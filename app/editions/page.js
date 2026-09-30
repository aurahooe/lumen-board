"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "../../lib/supabase";

export default function EditionsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase
      .from("hourly_log")
      .select("id,title,body,created_at")
      .order("created_at", { ascending: false })
      .limit(48)
      .then(({ data }) => setRows(data || []));
  }, []);

  return (
    <div className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Lumen<span>.</span></Link>
        <div className="nav-links">
          <Link href="/">Wall</Link>
          <Link href="/studio">Studio</Link>
        </div>
      </nav>
      <header className="hero" style={{ paddingTop: 40 }}>
        <div className="kicker">Hourly editions</div>
        <h1>What changed this hour.</h1>
        <p className="lede">The house keeps a short log whenever something new lands. Public notes stay on the wall; this is the workshop diary.</p>
      </header>
      <div className="list">
        {rows.length === 0 && (
          <div className="item"><div className="meta">No editions yet. The next hour will write one.</div></div>
        )}
        {rows.map((r, i) => (
          <div className="item" key={r.id} style={{ animation: `rise .5s ${0.03 * i}s ease both` }}>
            <div>
              <strong>{r.title}</strong>
              <div className="meta">{r.body}</div>
            </div>
            <div className="meta">{r.created_at ? new Date(r.created_at).toUTCString() : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
