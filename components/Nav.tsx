export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-black/80 backdrop-blur-md border-b border-white/5">
      {/* Wordmark */}
      <a href="#" className="flex items-center">
        <span
          className="text-white font-[200] tracking-[0.22em] uppercase"
          style={{ fontSize: "13px", letterSpacing: "0.22em" }}
        >
          Callvia
        </span>
      </a>

      {/* Links */}
      <div className="hidden md:flex items-center gap-7">
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
        <a href="#get-started" className="text-sm text-white/50 hover:text-white transition-colors duration-200">
          Get Started
        </a>
      </div>

      {/* CTA */}
      <a
        href="https://cal.com/jack-loosbrock-wzgbta/meeting-callvia"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent/40 rounded-full hover:bg-accent hover:text-white transition-all duration-200"
      >
        Book a Demo
      </a>

      {/* Mobile CTA */}
      <a
        href="https://cal.com/jack-loosbrock-wzgbta/meeting-callvia"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden inline-flex items-center px-3 py-1.5 text-xs font-medium text-accent border border-accent/40 rounded-full"
      >
        Demo
      </a>
    </nav>
  );
}
