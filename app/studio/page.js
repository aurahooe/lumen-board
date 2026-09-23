"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "../../lib/supabase";

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else {
        setUser(data.user);
        load(data.user.id);
      }
    });
  }, [router]);

  async function load(uid) {
    const supabase = getBrowserClient();
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    const supabase = getBrowserClient();
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setIsPublic(false);
    setOk(isPublic ? "Saved and on the public wall." : "Saved as a private draft.");
    load(user.id);
  }

  async function togglePublic(note) {
    const supabase = getBrowserClient();
    await supabase.from("notes").update({ is_public: !note.is_public, updated_at: new Date().toISOString() }).eq("id", note.id);
    load(user.id);
  }

  async function remove(note) {
    const supabase = getBrowserClient();
    await supabase.from("notes").delete().eq("id", note.id);
    load(user.id);
  }

  async function signOut() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!user) return null;

  return (
    <div className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Lumen<span>.</span></Link>
        <div className="nav-links">
          <Link href="/">Wall</Link>
          <button className="btn ghost" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <header className="hero" style={{ paddingTop: 36 }}>
        <div className="kicker">Your desk</div>
        <h1>Write it. Keep it. Or put it on the wall.</h1>
      </header>

      <form className="panel" style={{ margin: "0 0 40px" }} onSubmit={save}>
        <label>Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        <label>Note</label>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} />
        <label className="check">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Mark public — visible on the wall and eligible for the hourly feature
        </label>
        {err && <div className="err">{err}</div>}
        {ok && <div className="ok">{ok}</div>}
        <div className="row">
          <button className="btn" type="submit">Save note</button>
        </div>
      </form>

      <div className="list">
        {notes.map((n) => (
          <div className="item" key={n.id}>
            <div>
              <strong>{n.title}</strong>
              <div className="meta">{n.is_public ? "Public" : "Private"} · {new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div className="row">
              <button className="btn ghost" type="button" onClick={() => togglePublic(n)}>
                {n.is_public ? "Make private" : "Make public"}
              </button>
              <button className="btn ghost" type="button" onClick={() => remove(n)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
