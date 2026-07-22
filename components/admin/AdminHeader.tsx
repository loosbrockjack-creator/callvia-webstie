"use client";

export function AdminHeader() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex items-end justify-between mb-14">
      <div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Callvia
        </p>
        <h1 className="text-3xl font-light tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Agreements
        </h1>
      </div>
      <button
        onClick={logout}
        className="text-xs tracking-widest uppercase transition-colors duration-200"
        style={{ color: "#555555" }}
      >
        Sign out
      </button>
    </div>
  );
}
