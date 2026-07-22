import type { NextConfig } from "next";
import { BOOKING_URL } from "./lib/site";

// Note: cacheComponents is deliberately left off. Turning it on changes route
// segment config semantics repo-wide, and the agreement and admin pages depend
// on `dynamic = "force-dynamic"` behaving as it does today.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /onboarding used to collect client details and then send every visitor
      // to one hardcoded Stripe link. Paying clients now go through a signed
      // agreement at /agreement/<token>, created from /admin, so the old
      // self-serve path is retired rather than left as a second way to pay
      // without signing anything.
      { source: "/onboarding", destination: BOOKING_URL, permanent: true },
    ];
  },
};

export default nextConfig;
