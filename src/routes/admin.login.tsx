import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "/admin/dashboard",
    };
  },
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("adminToken")) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = await adminLogin(email, password);
      if (token) {
        localStorage.setItem("adminToken", token);
        navigate({ to: redirect as any });
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-500/50">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-300">Mallu Smart Internal Access</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@mallusmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12"
            />
          </div>
          <div className="space-y-4 pt-2">
            <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide uppercase transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? "Authenticating..." : "Secure Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
