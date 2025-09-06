"use client";

import { useEffect, useState } from "react";
import { getSessionUser, isAdminFast } from "@/lib/role";

export default function AuthDebug() {
  const [state, setState] = useState({ user: null, isAdmin: false, ready: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await getSessionUser(500);
        let isAdmin = false;
        if (u?.id) isAdmin = await isAdminFast(u.id);
        if (alive) setState({ user: u, isAdmin, ready: true });
      } catch (e) {
        if (alive) setState({ user: null, isAdmin: false, ready: true });
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!state.ready) return <pre style={{padding:16}}>Loading…</pre>;
  return (
    <pre style={{padding:16, direction:"ltr"}}>
{JSON.stringify({ user: state.user ? { id: state.user.id, email: state.user.email } : null, isAdmin: state.isAdmin }, null, 2)}
    </pre>
  );
}