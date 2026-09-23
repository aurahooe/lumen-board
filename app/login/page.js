"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    const supabase = getBrowserClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Account created. If email confirmation is on, check your inbox — otherwise go to Studio.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/studio");
      }
    } catch (ex) {
      setErr(ex.message || "Could not continue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Lumen<span>.</span></Link>
        <div className="nav-links"><Link href="/">Wall</Link></div>
      </nav>
      <form className="panel" onSubmit={submit}>
        <div className="kicker">{mode === "signup" ? "New desk" : "Return"}</div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 40, margin: "6px 0 8px" }}>
          {mode === "signup" ? "Create an account" : "Sign in"}
        </h1>
        <p className="meta">Email and password. Your drafts stay private until you mark them public.</p>
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
        <div className="row">
          <button className="btn" disabled={busy} type="submit">{busy ? "Working…" : mode === "signup" ? "Create account" : "Enter studio"}</button>
          <button className="btn ghost" type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "I already have one" : "Need an account"}
          </button>
        </div>
      </form>
    </div>
  );
}
