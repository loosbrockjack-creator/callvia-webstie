export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 md:px-12 py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Top row: wordmark + email */}
        <div className="flex items-center justify-between">
          <span
            className="text-white/50 font-[200] uppercase tracking-[0.22em]"
            style={{ fontSize: "12px" }}
          >
            Callvia
          </span>
          <a
            href="mailto:team@callvia.io"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            team@callvia.io
          </a>
        </div>

        {/* Middle: copyright centered */}
        <p className="text-xs text-center" style={{ color: "#444444" }}>
          © {new Date().getFullYear()} Callvia. All rights reserved.
        </p>

        {/* Bottom: legal links centered */}
        <div className="flex items-center justify-center gap-6">
          <a
            href="/privacy"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span className="text-[#333333] text-xs">·</span>
          <a
            href="/terms"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            Terms &amp; Conditions
          </a>
          <span className="text-[#333333] text-xs">·</span>
          <a
            href="/service-agreement"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            Service Agreement
          </a>
        </div>

      </div>
    </footer>
  );
}
