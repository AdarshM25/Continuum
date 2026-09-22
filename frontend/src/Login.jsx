import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Activity, ShieldCheck, History, User } from "lucide-react";
import { signup, login } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
        {/* Left panel — branding + feature highlights */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-800 text-white p-10 flex flex-col">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" />

          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-xl font-bold">
            C
          </div>

          <h1 className="text-3xl font-bold mt-8">CONTINUUM</h1>
          <p className="mt-3 text-white/85 text-sm leading-relaxed max-w-xs">
            A single, private home for your medical records — built for patients and the doctors
            they trust.
          </p>

          <div className="mt-auto space-y-5 pt-10">
            <Feature icon={<Activity size={18} />} title="Automatic extraction">
              Upload a lab report and see it parsed into a clear timeline.
            </Feature>
            <Feature icon={<ShieldCheck size={18} />} title="Your data, protected">
              Private by default — nothing is shared unless you choose to.
            </Feature>
            <Feature icon={<History size={18} />} title="Full history on demand">
              Every report you've uploaded, kept together in one place.
            </Feature>
          </div>
        </div>

        {/* Right panel — the actual form */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {mode === "login" ? "Sign in to view your health records" : "Start your own record in under a minute"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <IconInput icon={<User size={18} />} type="text" placeholder="Name" value={name} onChange={setName} required />
            )}
            <IconInput icon={<Mail size={18} />} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
            <IconInput
              icon={<Lock size={18} />}
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
            />

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="text-teal-700 font-medium hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
            >
              {mode === "login" ? "Register here" : "Sign in"}
            </button>
          </p>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} />
            Private by design — your data stays yours
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/75 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function IconInput({ icon, onChange, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}