import { prisma } from "@/server/db";

export default async function Dashboard() {
  const [leads, bookings] = await Promise.all([
    prisma.lead.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ take: 10, orderBy: { startsAt: "desc" } }),
  ]);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">Leads</h2>
        <div className="grid gap-2">
          {leads.map(l => (
            <div key={l.id} className="rounded-xl border border-white/10 p-3 bg-slate-900/60">
              <div className="text-sm text-slate-200">
                {(l.name ?? "—")} {(l.email ? `• ${l.email}` : "")} {(l.phone ? `• ${l.phone}` : "")}
              </div>
              <div className="text-xs text-slate-400">
                Interest: {l.interest ?? "—"} • {new Date(l.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {leads.length === 0 && <div className="text-slate-400 text-sm">No leads yet.</div>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Bookings</h2>
        <div className="grid gap-2">
          {bookings.map(b => (
            <div key={b.id} className="rounded-xl border border-white/10 p-3 bg-slate-900/60">
              <div className="text-sm text-slate-200">{b.vehicle ?? "Vehicle TBD"} — {b.status}</div>
              <div className="text-xs text-slate-400">{new Date(b.startsAt).toLocaleString()}</div>
            </div>
          ))}
          {bookings.length === 0 && <div className="text-slate-400 text-sm">No bookings yet.</div>}
        </div>
      </section>
    </main>
  );
}
