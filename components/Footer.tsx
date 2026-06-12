export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 md:px-12 pt-10 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Top row: wordmark + legal links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <span
            className="text-white/50 font-[200] uppercase tracking-[0.22em]"
            style={{ fontSize: "12px" }}
          >
            Callvia
          </span>
          <div className="flex items-center gap-6">
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
          </div>
        </div>

        {/* Bottom row: copyright + email */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/[0.04] pt-6">
          <p className="text-xs" style={{ color: "#444444" }}>
            © {new Date().getFullYear()} Callvia. All rights reserved.
          </p>
          <a
            href="mailto:team@callvia.io"
            className="text-xs text-[#555555] hover:text-[#aaaaaa] transition-colors duration-200"
          >
            team@callvia.io
          </a>
        </div>
      </div>
    </footer>
  );
}
