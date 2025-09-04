"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/role";

export default function AuthDebug() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) setAdmin(await isAdmin(user));
    })();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Auth Debug</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(
              {
                user: user
                  ? { id: user.id, email: user.email, user_metadata: user.user_metadata }
                  : null,
                isAdmin: admin,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </section>
  );
}