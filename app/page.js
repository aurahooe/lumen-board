"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserClient, hourKey, pickFeatured, timeToNextHour } from "../lib/supabase";

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [user, setUser] = useState(null);
  const [tick, setTick] = useState(0);
  const [ms, setMs] = useState(timeToNextHour());

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const supabase = getBrowserClient();
    async function load() {
      const { data } = await supabase
        .from("notes")
        .select("id,title,body,user_id,created_at,featured_at,is_public")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(60);
      setNotes(data || []);
      const ids = [...new Set((data || []).map((n) => n.user_id))];
      if (ids.length) {
        const { data: p } = await supabase.from("profiles").select("id,handle,display_name").in("id", ids);
        const map = {};
        (p || []).forEach((row) => { map[row.id] = row; });
        setProfiles(map);
      }
    }
    load();
  }, [tick]);

  useEffect(() => {
    const id = setInterval(() => {
      setMs(timeToNextHour());
      const nowKey = hourKey();
      if (window.__lumenHour !== nowKey) {
        window.__lumenHour = nowKey;
        setTick((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const key = hourKey();
  const featured = useMemo(() => pickFeatured(notes, key), [notes, key]);
  const rest = notes.filter((n) => n.id !== featured?.id);
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);

  return (
    <div className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Lumen<span>.</span></Link>
        <div className="nav-links">
          <Link href="/studio">Studio</Link>
          {user ? <span>{user.email}</span> : <Link href="/login">Sign in</Link>}
        </div>
      </nav>

      <header className="hero">
        <div className="kicker">Public wall · rotates on the hour</div>
        <h1>What people marked public lives here.</h1>
        <p className="lede">
          Write privately. Publish when you mean it. Every UTC hour, one public note
          is chosen as the house feature — no editors, no queue-jumping.
        </p>
        <div className="meter">
          <div><b>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</b>until the next hour</div>
          <div><b>{notes.length}</b>public notes on the wall</div>
          <div><b>{key.replace("T", " · ")}h</b>current slot (UTC)</div>
        </div>
      </header>

      {featured ? (
        <article className="feature">
          <div className="kicker">This hour</div>
          <h2>{featured.title}</h2>
          <p>{featured.body}</p>
          <div className="meta">
            {profiles[featured.user_id]?.display_name || profiles[featured.user_id]?.handle || "Member"}
            {" · "}
            {new Date(featured.created_at).toLocaleString()}
          </div>
        </article>
      ) : (
        <article className="feature">
          <div className="kicker">Quiet hour</div>
          <h2>The wall is empty.</h2>
          <p>Sign in, write something, and mark it public. The next hour will have a face.</p>
        </article>
      )}

      <div className="grid">
        {rest.map((n, i) => (
          <article className="card" key={n.id} style={{ animation: `rise .6s ${0.04 * i}s ease both` }}>
            <div className="badge">Public</div>
            <h3>{n.title}</h3>
            <p>{n.body.slice(0, 160)}{n.body.length > 160 ? "…" : ""}</p>
            <div className="meta" style={{ marginTop: 12 }}>
              {profiles[n.user_id]?.handle || "member"}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
