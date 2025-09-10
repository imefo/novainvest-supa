"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function fmtNumber(n) {
  try { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n||0); }
  catch { return String(n||0); }
}

function Countdown({ start, end }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(end).getTime() - now);
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const m = Math.floor((ms / (1000 * 60)) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return <span>{d}روز {h}:{m.toString().padStart(2,"0")}:{s.toString().padStart(2,"0")}</span>;
}

export default function ContestPage() {
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [joined, setJoined] = useState(false);
  const [leader, setLeader] = useState([]);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setErr("ابتدا وارد شوید."); return; }
        if (!alive) return;
        setMe(user);

        // مسابقه فعال
        const { data: c, error: eC } = await supabase.rpc("get_active_contest");
        if (eC) throw eC;
        if (!c) { setErr("مسابقه فعالی در حال حاضر وجود ندارد."); return; }
        setContest(c);

        // چک عضویت
        const { data: p } = await supabase
          .from("contest_participants")
          .select("user_id")
          .eq("contest_id", c.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setJoined(!!p);

        // لیدربرد
        const { data: lb, error: eLB } = await supabase.rpc("get_contest_leaderboard", { p_contest_id: c.id });
        if (eLB) throw eLB;
        setLeader(lb || []);
      } catch (e) {
        console.error(e);
        if (alive) setErr("خطا در بارگذاری مسابقه.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const myRow = useMemo(() => leader.find(x => x.user_id === me?.id), [leader, me]);

  async function join() {
    if (!contest) return;
    const { error } = await supabase.rpc("join_contest", { p_contest_id: contest.id });
    if (error) { alert("خطا در پیوستن."); return; }
    setJoined(true);
    // ریفرش لیدربرد بعد از عضویت
    const { data: lb } = await supabase.rpc("get_contest_leaderboard", { p_contest_id: contest.id });
    setLeader(lb || []);
  }

  return (
    <div className="nv-container">
      <div className="lux-card" style={{padding:16, marginTop:12}}>
        <div className="flex-row">
          <h2 style={{margin:0}}>🏆 مسابقه دعوت</h2>
          {contest && (
            <div className="muted" style={{fontWeight:700}}>
              جایزه: <b>{contest.reward_usdt} USDT</b> | باقی‌مانده: <Countdown start={contest.start_at} end={contest.end_at} />
            </div>
          )}
        </div>

        {err && <div className="lux-alert" style={{marginTop:10}}>{err}</div>}

        {!loading && contest && (
          <>
            <div style={{marginTop:10}} className="muted">
              هر کاربری که در بازۀ {new Date(contest.start_at).toLocaleDateString("fa-IR")} تا {new Date(contest.end_at).toLocaleDateString("fa-IR")}
              {" "}بیشترین دعوتِ تأییدشده داشته باشد، برندهٔ <b>{contest.reward_usdt} USDT</b> می‌شود.
            </div>

            <div style={{display:"flex", gap:10, marginTop:12, flexWrap:"wrap"}}>
              {!joined ? (
                <button className="nv-btn nv-btn-primary" onClick={join}>شرکت در مسابقه</button>
              ) : (
                <span className="chip success">در مسابقه هستید</span>
              )}
              <Link className="nv-btn" href="/dashboard">بازگشت به داشبورد</Link>
            </div>

            <div className="lux-card" style={{marginTop:16}}>
              <div className="lux-card-head">
                <div className="title">لیدربرد</div>
                <div className="muted">Top 50</div>
              </div>
              <div className="table">
                <div className="tr head">
                  <div className="td">رتبه</div>
                  <div className="td">کاربر</div>
                  <div className="td">دعوت‌های تأییدشده</div>
                </div>
                {leader.map((row, i) => (
                  <div key={row.user_id} className={`tr ${row.user_id===me?.id ? "me":""}`}>
                    <div className="td">{i+1}</div>
                    <div className="td">{row.user_id.slice(0,8)}…</div>
                    <div className="td">{fmtNumber(row.invites)}</div>
                  </div>
                ))}
                {leader.length===0 && <div className="muted" style={{padding:12}}>هنوز رکوردی نیست.</div>}
              </div>

              {myRow && (
                <div className="muted" style={{marginTop:10}}>
                  وضعیت شما: <b>{fmtNumber(myRow.invites)}</b> دعوت.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}