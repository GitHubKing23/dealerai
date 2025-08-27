import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-semibold">DealerAI</h1>
        <p className="text-slate-300">AI chat widget that answers inventory questions and books test drives.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="rounded-xl bg-cyan-500 text-slate-900 px-5 py-3 font-medium">
            Go to Dashboard
          </Link>
        </div>
        <section className="text-left bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Embed on your website</h2>
          <pre className="text-xs overflow-auto bg-slate-950 p-3 rounded">{`<script src="/widget.js" data-dealer="demo-dealer"></script>`}</pre>
        </section>
      </div>
    </main>
  );
}
