export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="relative max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Wordmark */}
        <a href="#" className="flex items-center">
          <span
            className="text-white font-[200] tracking-[0.22em] uppercase"
            style={{ fontSize: "13px", letterSpacing: "0.22em" }}
          >
            Callvia
          </span>
        </a>

        {/* Links, absolutely centered so uneven wordmark/CTA widths can't skew them */}
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            How It Works
          </a>
          <a href="#who-its-for" className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            Who It&#39;s For
          </a>
          <a href="#demo" className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            Live Demo
          </a>
        </div>

        {/* CTA */}
        <a
          href="/build"
          className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent/40 rounded-full hover:bg-accent hover:text-white transition-all duration-200"
        >
          Build My Receptionist
        </a>

        {/* Mobile CTA */}
        <a
          href="/build"
          className="md:hidden inline-flex items-center px-3 py-1.5 text-xs font-medium text-accent border border-accent/40 rounded-full"
        >
          Build
        </a>
      </div>
    </nav>
  );
}
