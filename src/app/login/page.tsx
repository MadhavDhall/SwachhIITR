"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recycle, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useAuthStore, initAuthFromStorage } from "@/lib/auth/store";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  { email: "priya.sharma@wasteos.demo", role: "Admin", name: "Priya Sharma" },
  { email: "marco.reyes@wasteos.demo", role: "Operator", name: "Marco Reyes" },
  { email: "aisha.patel@wasteos.demo", role: "Driver", name: "Aisha Patel" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    const stored = initAuthFromStorage();
    if (stored) {
      setUser(stored);
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Login failed");
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setError("");
    const result = await login(demoEmail, "demo");
    if (result.success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative bg-slate-950 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-teal-600/6 rounded-full blur-[80px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Recycle size={22} weight="bold" className="text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              WasteOS
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold text-white tracking-tight leading-[1.1] mb-4">
              Intelligent waste management,{" "}
              <span className="text-emerald-400">simplified.</span>
            </h1>
            <p className="text-base text-white/50 leading-relaxed max-w-[45ch]">
              AI-powered waste detection, real-time bin monitoring, and
              optimized collection routes in one unified platform.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/30">
            <span>WasteDNA Detection</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>BinSync Monitoring</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Route Optimization</span>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Recycle size={20} weight="bold" className="text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              WasteOS
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the operations dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@wasteos.demo"
                className="w-full h-11 px-3.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Any password (demo mode)"
                  className="w-full h-11 px-3.5 pr-10 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeSlash size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 rounded-lg bg-emerald-600 text-white text-sm font-medium",
                "flex items-center justify-center gap-2",
                "hover:bg-emerald-500 active:scale-[0.98] transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Demo quick login */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  Demo accounts
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 active:scale-[0.99] transition-all duration-200 group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-emerald-500">
                      {account.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {account.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.role}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground/60">
              Demo mode - any password accepted.
              <br />
              No real authentication is active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
