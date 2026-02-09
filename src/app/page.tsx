import { Button } from "../components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const Home = async () => {
  const user = await currentUser();
  if (user) {
    redirect(`/dashboard`);
  }
  return (
    <div className="relative flex min-h-screen w-screen flex-col overflow-x-hidden overscroll-none bg-[#0a0a0f]">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
          AI-Powered · Real-time
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Collaborative Cloud Code Editor
        </h1>
        <p className="mt-4 max-w-2xl text-xl font-medium text-purple-200/90">
          AI Powered, Auto-Scaling Copilot
        </p>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
          A virtual code editing environment with custom AI auto-completion and
          real-time collaboration. Built on Docker containers—code together,
          scale effortlessly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/sign-in">
            <Button
              className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/40"
              size="lg"
            >
              Go To App
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {["Real-time collaboration", "AI code completion", "Docker-based"].map(
            (label) => (
              <span
                key={label}
                className="rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300"
              >
                {label}
              </span>
            )
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-zinc-800/80 py-4 text-center text-sm text-zinc-500">
        CCCE — Collaborative Cloud Code Editor
      </footer>
    </div>
  );
};

export default Home;
