import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata = {
  title: "Admin | Callvia",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest uppercase mb-8" style={{ color: "#555555" }}>
          Callvia
        </p>
        <h1 className="text-2xl font-light tracking-tight mb-8" style={{ letterSpacing: "-0.025em" }}>
          Admin
        </h1>
        <AdminLogin />
      </div>
    </main>
  );
}
