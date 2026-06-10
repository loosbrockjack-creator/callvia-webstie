export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 md:px-12 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Wordmark */}
        <span
          className="text-white/50 font-[200] uppercase tracking-[0.22em]"
          style={{ fontSize: "12px" }}
        >
          Callvia
        </span>

        {/* Copyright */}
        <p className="text-xs" style={{ color: "#444444" }}>
          © {new Date().getFullYear()} Callvia. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="mailto:hello@callvia.com"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            hello@callvia.com
          </a>
        </div>
      </div>
    </footer>
  );
}
