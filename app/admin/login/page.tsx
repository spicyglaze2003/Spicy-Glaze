"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";
import { api } from "@/lib/axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/login")) {
      router.replace("/adminkavinspicyglaze/login/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      // Authenticate against Strapi admin or custom auth endpoint
      const { data } = await api.post("/auth/local", {
        identifier: email,
        password,
      });

      login({
        id: data.user.id,
        name: data.user.username || data.user.email,
        email: data.user.email,
        role: data.user.role || "super-admin",
        token: data.jwt,
        avatar: null,
      });

      toast.success("Welcome back!");
      router.push(
        typeof window !== "undefined" && window.location.pathname.startsWith("/adminkavinspicyglaze")
          ? "/adminkavinspicyglaze/"
          : "/admin/"
      );
    } catch {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative overflow-hidden items-center justify-center">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="text-6xl mb-6">🌶️</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Spicy<span className="text-orange-400">Glaze</span>
          </h1>
          <p className="text-white/40 text-lg mb-8">Admin Control Center</p>

          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              "Full product & inventory management",
              "Real-time order tracking",
              "AI-powered business insights",
              "Complete content control",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-white/60 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <div className="text-5xl mb-3">🌶️</div>
            <h1 className="text-3xl font-bold text-gray-900">
              Spicy<span className="text-orange-500">Glaze</span>
            </h1>
            <p className="text-gray-400 mt-1">Admin Panel</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">
              Sign in to manage your store
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="spicyglaze2003@gmail.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} SpicyGlaze. Admin access only.
          </p>
        </div>
      </div>
    </div>
  );
}
