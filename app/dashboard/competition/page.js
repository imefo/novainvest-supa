// app/dashboard/competition/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function CompetitionPage() {
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // مسابقه‌های فعال (الان بین start/end)
        const now = new Date().toISOString();
        const { data: comps, error: compsErr } = await supabase
          .from("referral_competitions")
          .select("*")
          .lte("start_date", now)
          .gte("end_date", now)
          .order("start_date", { ascending: false });

        if (compsErr) throw compsErr;

        // اگر مسابقه فعال نداریم، آخرین مسابقه را نشان بده
        let useComps = comps ?? [];
        if (!useComps.length) {
          const { data: lastComps, error: lastErr } = await supabase
            .from("referral_competitions")
            .select("*")
            .order("start_date", { ascending: false })
            .limit(1);
          if (lastErr) throw lastErr;
          useComps = lastComps ?? [];
        }

        setCompetitions(useComps);

        // لیدربرد برای اولین مسابقه
        if (useComps[0]?.id) {
          const compId = useComps[0].id;
          const { data: lb, error: lbErr } = await supabase
            .from("referral_competition_leaderboard")
            .select("*")
            .eq("competition_id", compId)
            .order("invites_count", { ascending: false });
          if (lbErr) throw lbErr;
          setLeaderboard(lb ?? []);
        } else {
          setLeaderboard([]);
        }
      } catch (e) {
        setErr(e?.message || "خطا در بارگذاری مسابقه");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>مسابقه دعوت از دوستان 🎯</h1>
      {err && <div className="alert error">خطا: {err}</div>}
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <>
          {competitions.length ? (
            competitions.map((c) => (
              <div key={c.id} className="card" style={{ marginTop: 12 }}>
                <div className="muted">عنوان مسابقه</div>
                <h3 style={{ marginTop: 6, marginBottom: 6 }}>{c.title}</h3>
                <div className="muted">
                  از {new Date(c.start_date).toLocaleDateString("fa-IR")} تا{" "}
                  {new Date(c.end_date).toLocaleDateString("fa-IR")}
                </div>
                <div style={{ marginTop: 8 }}>
                  جایزه: <strong>{c.reward_usdt} USDT</strong>
                </div>
              </div>
            ))
          ) : (
            <div className="muted">در حال حاضر مسابقه‌ای تعریف نشده است.</div>
          )}

          <div className="page-section" style={{ paddingTop: 24 }}>
            <h2 style={{ marginTop: 0 }}>لیدربرد</h2>
            {leaderboard.length ? (
              <div className="table-wrap">
                <table className="nv-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>کاربر</th>
                      <th>تعداد دعوت موفق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row, idx) => (
                      <tr key={row.referrer_id + "-" + idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <Link href={`/dashboard/users/${row.referrer_id}`} className="nv-link">
                            {row.referrer_id}
                          </Link>
                        </td>
                        <td><strong>{row.invites_count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="muted">هنوز رکوردی برای این مسابقه ثبت نشده.</div>
            )}

            {top3.length ? (
              <div style={{ marginTop: 16 }}>
                <div className="muted" style={{ marginBottom: 6 }}>برندگان فعلی (Top 3)</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {top3.map((row, i) => (
                    <div key={row.referrer_id} className="chip">
                      {i + 1}. {row.referrer_id.slice(0, 6)}… — {row.invites_count}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <h3 style={{ marginTop: 0 }}>لینک دعوت شما</h3>
            <p className="muted" style={{ marginTop: 6 }}>
              لینک دعوت را برای دوستان‌تان بفرستید؛ هر ثبت‌نام موفق، برای شما امتیاز دعوت محسوب می‌شود.
            </p>
            <InviteLink />
          </div>
        </>
      )}
    </div>
  );
}

function InviteLink() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      if (!uid) return;
      const url = new URL(window.location.origin);
      url.pathname = "/";
      url.searchParams.set("ref", uid);
      if (alive) setLink(url.toString());
    })();
    return () => { alive = false; };
  }, []);

  if (!link) return null;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <code style={{ background: "rgba(255,255,255,.06)", padding: "8px 10px", borderRadius: 8 }}>
        {link}
      </code>
      <button
        className="nv-btn"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch { /* no-op */ }
        }}
      >
        {copied ? "کپی شد ✅" : "کپی لینک"}
      </button>
    </div>
  );
}