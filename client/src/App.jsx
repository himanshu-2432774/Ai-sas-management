import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CircleHelp,
  CreditCard,
  Copy,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { api, getApiError } from "./api";
import { AuthProvider } from "./auth";
import { useAuth } from "./authContext";

const pageTitles = {
  "/app": "Overview",
  "/app/profile": "Your profile",
  "/app/generator": "AI Generator",
  "/app/admin": "Admin overview",
};

function LoadingScreen({ label = "Loading your workspace" }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
      <div className="flex items-center gap-3 text-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}

function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/app" replace />;
  return <Outlet />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/app" replace /> : children;
}

function Brand({ inverse = false }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Aster home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/15">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={`text-lg font-semibold tracking-tight ${inverse ? "text-white" : "text-slate-950"}`}>
        Aster<span className="text-brand-600">.</span>
      </span>
    </Link>
  );
}

function Notice({ children, tone = "error" }) {
  const styles = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles}`} role="alert">
      {children}
    </div>
  );
}

function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(360px,0.88fr)_1.12fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-44 top-28 h-[30rem] w-[30rem] rounded-full border border-white/10" />
        <div className="absolute -right-24 top-48 h-[22rem] w-[22rem] rounded-full border border-white/10" />
        <div className="absolute -right-4 top-72 h-[14rem] w-[14rem] rounded-full bg-brand-600/20 blur-3xl" />
        <Brand inverse />
        <div className="relative z-10 max-w-lg pb-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            A clearer view of your AI business
          </div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em] xl:text-5xl">
            Your AI workspace, <span className="text-brand-300">in focus.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
            Manage your account, keep an eye on usage, and understand your subscription from one calm, considered workspace.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Activity className="h-5 w-5 text-brand-300" aria-hidden="true" />
              <p className="mt-5 text-sm font-medium">Account overview</p>
              <p className="mt-1 text-xs text-slate-400">Profile, plan, credits, and usage</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              <p className="mt-5 text-sm font-medium">Role-aware access</p>
              <p className="mt-1 text-xs text-slate-400">User and admin routes</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">Aster workspace · AI SaaS Management</p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <div className="lg:hidden"><Brand /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8 lg:hidden">
            <span className="eyebrow">ASTER WORKSPACE</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
          {children}
          <div className="mt-7 text-center text-sm text-slate-500">{footer}</div>
        </div>
        <div className="flex justify-center gap-5 pb-3 text-xs text-slate-400">
          <span>Secure account access</span><span aria-hidden="true">·</span><span>AI SaaS Management</span>
        </div>
      </section>
    </main>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          className={`field-input ${Icon ? "pl-10" : ""}`}
          {...props}
        />
      </span>
    </label>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to see your account, subscription, and usage."
      footer={<>New to Aster? <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/register">Create an account</Link></>}
    >
      <div className="space-y-5">
        {error && <Notice>{error}</Notice>}
        {error.toLowerCase().includes("verify your email") && (
          <ResendVerificationForm initialEmail={email} />
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          label="Password"
          icon={LockKeyhole}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="button-primary w-full" type="submit" disabled={submitting}>
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Sign in"}
          {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
        </form>
      </div>
    </AuthFrame>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setVerificationEmailSent(data?.data?.verificationEmailSent === true);
      setSuccess(true);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame
      title={success ? "Account created" : "Create your account"}
      subtitle={success ? "Your account was created by the backend." : "Start with your account details. Your password must be at least 6 characters."}
      footer={!success && <>Already have an account? <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">Sign in</Link></>}
    >
      {success ? (
        <div className="space-y-5">
          <Notice tone="success"><span className="inline-flex items-center gap-2 font-medium"><Check className="h-4 w-4" aria-hidden="true" /> Registration completed</span></Notice>
          {verificationEmailSent ? (
            <p className="text-sm leading-6 text-slate-600">We sent a verification link to <strong>{form.email}</strong>. The link expires in 15 minutes and can only be used once.</p>
          ) : (
            <>
              <Notice>The account was created, but the verification email could not be sent. Check server email configuration or request another email below.</Notice>
              <ResendVerificationForm initialEmail={form.email} />
            </>
          )}
          <button className="button-primary w-full" type="button" onClick={() => navigate("/login")}>Go to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Notice>{error}</Notice>}
          <Field
            label="Full name"
            icon={Users}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            minLength={2}
            required
          />
          <Field
            label="Email address"
            icon={Mail}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <Field
            label="Password"
            icon={LockKeyhole}
            type="password"
            name="new-password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={6}
            required
          />
          <button className="button-primary w-full" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Create account"}
            {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          <p className="text-center text-xs leading-5 text-slate-400">Registration connects directly to the existing account API.</p>
        </form>
      )}
    </AuthFrame>
  );
}

function ResendVerificationForm({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/resend-verification", { email: email.trim() });
      setMessage(data?.message || "Verification email sent. Check your inbox.");
    } catch (requestError) {
      setError(getApiError(requestError, "Could not resend the verification email."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4" onSubmit={handleSubmit}>
      <p className="text-sm font-medium text-amber-950">Need another verification email?</p>
      <Field
        label="Account email"
        icon={Mail}
        type="email"
        name="resend-email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      {message && <p className="text-sm text-emerald-800" role="status">{message}</p>}
      {error && <Notice>{error}</Notice>}
      <button className="button-secondary w-full" type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get("token"));
  const verificationRequest = useRef(null);
  const [status, setStatus] = useState(() => token
    ? { loading: true, error: "", success: "" }
    : { loading: false, error: "Verification link is missing its token.", success: "" });

  useEffect(() => {
    let active = true;

    if (!token) {
      return () => { active = false; };
    }

    if (!verificationRequest.current) {
      verificationRequest.current = api.get(`/auth/verify-email/${encodeURIComponent(token)}`)
        .then(({ data }) => ({
          error: "",
          success: data?.message === "Email verified successfully"
            ? "Email verified — you can log in."
            : data?.message || "Email verified — you can log in."
        }))
        .catch((requestError) => ({
          error: getApiError(requestError, "This verification link is invalid or expired. Request a new email."),
          success: ""
        }));
    }

    verificationRequest.current.then((result) => {
      if (active) {
        setStatus({ loading: false, ...result });
      }
    });

    if (window.location.search) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.hash}`
      );
    }

    return () => { active = false; };
  }, [token]);

  return (
    <AuthFrame
      title="Email verification"
      subtitle="Confirm your email address to activate account sign-in."
      footer={<>Already verified? <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">Sign in</Link></>}
    >
      <div className="space-y-5">
        {status.loading ? (
          <p className="flex items-center gap-2 text-sm text-slate-600" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying your email…
          </p>
        ) : status.error ? (
          <>
            <Notice>{status.error}</Notice>
            <ResendVerificationForm />
            <Link className="button-secondary w-full" to="/register">Create another account</Link>
          </>
        ) : (
          <>
            <Notice tone="success">{status.success}</Notice>
            <Link className="button-primary w-full" to="/login">Continue to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </>
        )}
      </div>
    </AuthFrame>
  );
}

function SidebarLink({ to, icon: Icon, children, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-brand-50 text-brand-800"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {children}
    </NavLink>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const title = pageTitles[location.pathname] || "Workspace";

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200/80 bg-white px-5 py-6 transition-transform lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-2"><Brand /></div>
        <div className="mt-10">
          <p className="eyebrow px-3">WORKSPACE</p>
          <nav className="mt-3 space-y-1" aria-label="Main navigation">
            <SidebarLink to="/app" icon={LayoutDashboard} end onClick={() => setMobileMenuOpen(false)}>Overview</SidebarLink>
            <SidebarLink to="/app/generator" icon={Sparkles} onClick={() => setMobileMenuOpen(false)}>AI Generator</SidebarLink>
            <SidebarLink to="/app/profile" icon={Users} onClick={() => setMobileMenuOpen(false)}>Your profile</SidebarLink>
            {user?.role === "admin" && <SidebarLink to="/app/admin" icon={ShieldCheck} onClick={() => setMobileMenuOpen(false)}>Admin overview</SidebarLink>}
          </nav>
        </div>
        <div className="mt-auto">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">Need a hand?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Your workspace reflects the information currently available from the API.</p>
          </div>
          <button className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50" type="button" onClick={logout}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{user?.name?.slice(0, 1)?.toUpperCase() || "A"}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">{user?.name || "Account"}</span>
              <span className="block truncate text-xs text-slate-500">{user?.email || ""}</span>
            </span>
            <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <button className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden" aria-label="Close navigation menu" type="button" onClick={() => setMobileMenuOpen(false)} />}

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button type="button" className="icon-button lg:hidden" aria-label="Open navigation menu" onClick={() => setMobileMenuOpen(true)}><Menu className="h-5 w-5" /></button>
              <div>
                <p className="eyebrow hidden sm:block">AI SAAS MANAGEMENT</p>
                <h1 className="text-base font-semibold tracking-tight text-slate-900">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
                Personal workspace
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800" aria-label={`Signed in as ${user?.name || "user"}`}>
                {user?.name?.slice(0, 1)?.toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = "brand", loading }) {
  const accentStyles = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${accentStyles[accent]}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">From your account</span>
      </div>
      <p className="mt-6 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-100" /> : value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState([]);
  const [profileError, setProfileError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get("/user/profile"),
      api.get("/usage/stats"),
      api.get("/usage"),
    ]).then(([profileResult, statsResult, usageResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data?.data || null);
        if (!profileResult.value.data?.data) setProfileError("The profile API returned no account data.");
      } else {
        setProfileError(getApiError(profileResult.reason, "Could not load profile details."));
      }
      if (statsResult.status === "fulfilled") {
        const statsData = statsResult.value.data;
        if (typeof statsData?.totalRequests === "number" && typeof statsData?.totalCreditsUsed === "number") {
          setStats(statsData);
        } else {
          setStatsError("The usage statistics API returned an unexpected response.");
        }
      } else {
        setStatsError(getApiError(statsResult.reason, "Could not load usage statistics."));
      }
      if (usageResult.status === "fulfilled") {
        const usageData = usageResult.value.data?.usage;
        if (Array.isArray(usageData)) {
          setUsage(usageData);
        } else {
          setActivityError("The usage history API returned an unexpected response.");
        }
      } else {
        setActivityError(getApiError(usageResult.reason, "Could not load recent activity."));
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const account = profile || user;
  const displayName = account?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title={`Good to see you, ${displayName}`}
        description="A live snapshot of your account and activity, pulled from your AI SaaS backend."
      />
      {profileError && <div className="mb-6"><Notice>{profileError}</Notice></div>}
      {statsError && <div className="mb-6"><Notice>{statsError}</Notice></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current plan" value={account?.plan || "Unavailable"} detail={account?.subscriptionStatus ? `Subscription ${account.subscriptionStatus}` : "No subscription status returned"} icon={CreditCard} loading={loading} />
        <StatCard label="Credits available" value={typeof account?.credits === "number" ? account.credits.toLocaleString() : "Unavailable"} detail="Current balance reported by your account" icon={Wallet} accent="green" loading={loading} />
        <StatCard label="Requests made" value={typeof stats?.totalRequests === "number" ? stats.totalRequests.toLocaleString() : "Unavailable"} detail="All-time usage records" icon={Activity} accent="blue" loading={loading} />
        <StatCard label="Credits used" value={typeof stats?.totalCreditsUsed === "number" ? stats.totalCreditsUsed.toLocaleString() : "Unavailable"} detail="Calculated from recorded usage" icon={BarChart3} accent="amber" loading={loading} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel title="Recent activity" subtitle="Your latest recorded API usage">
          {activityError ? <div className="p-5"><Notice>{activityError}</Notice></div> : usage.length === 0 ? (
            <EmptyState icon={Activity} title={loading ? "Loading activity" : "No usage recorded yet"} description={loading ? "Your recent activity will appear here." : "When you use an AI service, its recorded usage will show up here."} />
          ) : (
            <div className="divide-y divide-slate-100">
              {usage.slice(0, 6).map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.service || "AI service"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}</p>
                  </div>
                  <span className="shrink-0 text-right text-sm font-semibold text-slate-700">{typeof item.creditsUsed === "number" ? `${item.creditsUsed} credits` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Account snapshot" subtitle="Details from your current profile">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <InfoRow label="Account status" value={account?.isActive === true ? "Active" : account?.isActive === false ? "Inactive" : "Unavailable"} tone={account?.isActive ? "green" : "gray"} />
              <InfoRow label="Email verification" value={account?.isVerified === true ? "Verified" : account?.isVerified === false ? "Not verified" : "Unavailable"} tone={account?.isVerified ? "green" : "amber"} />
              <InfoRow label="Subscription status" value={account?.subscriptionStatus || "Unavailable"} />
              <InfoRow label="Member since" value={account?.createdAt ? new Date(account.createdAt).toLocaleDateString() : "Unavailable"} />
            </div>
          </Panel>
          <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Plan information</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">Your current plan and credits are shown directly from your account data.</p>
              </div>
              <CreditCard className="h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><CircleHelp className="h-4 w-4" aria-hidden="true" /> Plan catalogue and upgrades are not available in the current API.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function GeneratorPage() {
  const { user, refreshUser } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [generating, setGenerating] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Enter a prompt before generating a response.");
      setResult("");
      return;
    }

    setGenerating(true);
    setError("");
    setNotice("");
    setResult("");

    try {
      const { data } = await api.post("/ai/generate", { prompt: trimmedPrompt });

      if (typeof data?.response !== "string" || !data.response.trim()) {
        throw new Error("The AI service returned an empty response.");
      }

      setResult(data.response.trim());
      if (typeof data.remainingCredits === "number") {
        setNotice(`${data.remainingCredits} credits remaining.`);
      }

      try {
        await refreshUser();
      } catch {
        setNotice("Response generated. Credits will refresh when you revisit the overview.");
      }
    } catch (requestError) {
      const status = requestError.response?.status;
      const backendMessage = requestError.response?.data?.message;

      if (status === 401) {
        setError("Your session has expired or is invalid. Sign in again to continue.");
      } else if (status === 403 && backendMessage === "No credits remaining") {
        setError("You’re out of credits. Contact your administrator about your account plan.");
      } else if (status === 403 && backendMessage === "Subscription expired") {
        setError("Your subscription has expired. Renew your plan before generating more responses.");
      } else {
        setError(getApiError(requestError, "The AI service could not complete your request."));
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setNotice("Response copied to clipboard.");
    } catch {
      setError("Could not access the clipboard. Select and copy the response instead.");
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="AI TOOLS"
        title="AI Generator"
        description="Demo/Mock Mode — enter a prompt to view the backend's local testing response."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className="card p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Your prompt</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Be specific about the response you want.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium capitalize text-brand-800">
              {typeof user?.credits === "number" ? `${user.credits} credits` : "Credits unavailable"}
            </span>
          </div>
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900" role="note">
            Demo/Mock Mode: this is a local testing response, not real AI-generated output.
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Prompt</span>
              <textarea
                className="field-input min-h-48 resize-y"
                name="prompt"
                placeholder="For example: Explain how retrieval-augmented generation works to a product manager."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={5000}
                required
                aria-describedby="prompt-hint prompt-count"
              />
              <span id="prompt-hint" className="mt-2 block text-xs text-slate-400">
                {prompt.trim()
                  ? "Your prompt is sent to the authenticated generation endpoint."
                  : "Enter a prompt to enable generation."}
              </span>
              <span id="prompt-count" className="mt-1 block text-right text-xs text-slate-400">{prompt.length}/5000</span>
            </label>
            {error && <Notice>{error}</Notice>}
            {notice && <p className="text-sm text-emerald-700" role="status">{notice}</p>}
            <button className="button-primary" type="submit" disabled={generating || !prompt.trim()}>
              {generating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {generating ? "Generating…" : "Generate response"}
              {!generating && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>
        </section>

        <section className="card min-h-72">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Generated response</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">The result returned by your backend.</p>
            </div>
            {result && (
              <button className="icon-button" type="button" onClick={copyResult} aria-label="Copy response" title="Copy response">
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="p-5 sm:p-6" aria-live="polite" aria-busy={generating}>
            {generating ? (
              <div className="flex items-center gap-3 py-5 text-sm text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                Generating your response…
              </div>
            ) : result ? (
              <>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" /> Demo/Mock Mode
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{result}</p>
              </>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Your response will appear here"
                description="Submit a prompt to see the demo output returned by the backend."
              />
            )}
          </div>
        </section>
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-400">
        Real AI API integration is not configured. This page displays a local mock response; each successful request records one usage event and deducts one credit.
      </p>
    </>
  );
}

function InfoRow({ label, value, tone = "gray" }) {
  const dot = { green: "bg-emerald-500", amber: "bg-amber-500", gray: "bg-slate-300" }[tone];
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="inline-flex items-center gap-2 text-xs font-medium capitalize text-slate-700"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />{value}</span>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/user/profile")
      .then(({ data }) => {
        const profile = data?.data;
        if (!profile) throw new Error("The backend did not return profile details.");
        if (active) setForm({ name: profile.name || "", email: profile.email || "" });
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, "Could not load your profile."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.put("/user/profile", form);
      const profile = data?.data;
      if (!profile) throw new Error("The backend did not return the updated profile.");
      setForm({ name: profile.name || "", email: profile.email || "" });
      setNotice("Your profile was updated.");
    } catch (requestError) {
      setError(getApiError(requestError, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="ACCOUNT SETTINGS" title="Your profile" description="View and update the profile details stored for your account." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <section className="card p-5 sm:p-7">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900">Personal information</h3>
            <p className="mt-1 text-xs text-slate-500">Changes are saved to your account through the user profile API.</p>
          </div>
          {error && <div className="mb-5"><Notice>{error}</Notice></div>}
          {notice && <div className="mb-5"><Notice tone="success">{notice}</Notice></div>}
          <form className="space-y-5" onSubmit={saveProfile}>
            <Field label="Full name" type="text" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} required disabled={loading} />
            <Field label="Email address" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required disabled={loading} />
            <div className="border-t border-slate-100 pt-5">
              <button className="button-primary" type="submit" disabled={loading || saving}>
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>
        <section className="card p-5 sm:p-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><BadgeCheck className="h-5 w-5" aria-hidden="true" /></div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Account details</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">These details are supplied by the authenticated profile endpoint.</p>
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <InfoRow label="Role" value={user?.role || "Unavailable"} />
            <InfoRow label="Plan" value={user?.plan || "Unavailable"} />
            <InfoRow label="Credits" value={typeof user?.credits === "number" ? user.credits.toLocaleString() : "Unavailable"} />
            <InfoRow label="Verified" value={user?.isVerified === true ? "Yes" : user?.isVerified === false ? "No" : "Unavailable"} tone={user?.isVerified ? "green" : "amber"} />
          </div>
          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Password changes and account deletion are not included in this profile screen.</p>
        </section>
      </div>
    </>
  );
}

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get("/admin/stats"),
      api.get("/admin/users", { params: { limit: 8, sortBy: "createdAt", order: "desc" } }),
    ])
      .then(([statsResult, usersResult]) => {
        if (!active) return;
        if (statsResult.status === "fulfilled") {
          const statsData = statsResult.value.data;
          if (typeof statsData?.totalUsers === "number" && typeof statsData?.totalRequests === "number") {
            setStats(statsData);
          } else {
            setStatsError("The admin statistics API returned an unexpected response.");
          }
        } else {
          setStatsError(getApiError(statsResult.reason, "Could not load admin statistics."));
        }
        if (usersResult.status === "fulfilled") {
          const usersData = usersResult.value.data?.data?.users;
          if (Array.isArray(usersData)) {
            setUsers(usersData);
          } else {
            setUsersError("The admin users API returned an unexpected response.");
          }
        } else {
          setUsersError(getApiError(usersResult.reason, "Could not load user accounts."));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHeading eyebrow="ADMINISTRATION" title="Admin overview" description="Account and usage summaries returned by the protected admin APIs." />
      {statsError && <div className="mb-6"><Notice>{statsError}</Notice></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={typeof stats?.totalUsers === "number" ? stats.totalUsers.toLocaleString() : "Unavailable"} detail="Active and soft-deleted accounts" icon={Users} loading={loading} />
        <StatCard label="Administrators" value={typeof stats?.totalAdmins === "number" ? stats.totalAdmins.toLocaleString() : "Unavailable"} detail="Accounts with admin role" icon={ShieldCheck} accent="green" loading={loading} />
        <StatCard label="Total requests" value={typeof stats?.totalRequests === "number" ? stats.totalRequests.toLocaleString() : "Unavailable"} detail="Recorded service usage" icon={Activity} accent="blue" loading={loading} />
        <StatCard label="Credits used" value={typeof stats?.totalCreditsUsed === "number" ? stats.totalCreditsUsed.toLocaleString() : "Unavailable"} detail="Across recorded requests" icon={BarChart3} accent="amber" loading={loading} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Recent accounts" subtitle="Latest users returned by the admin users endpoint">
          {usersError ? <div className="p-5"><Notice>{usersError}</Notice></div> : users.length === 0 ? <EmptyState icon={Users} title={loading ? "Loading accounts" : "No accounts available"} description="User records will appear when the API returns them." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr><th className="px-6 py-3 font-semibold">User</th><th className="px-4 py-3 font-semibold">Plan</th><th className="px-4 py-3 font-semibold">Credits</th><th className="px-6 py-3 font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{item.name || "Name unavailable"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.email || "Email unavailable"}</p>
                      </td>
                      <td className="px-4 py-4 capitalize text-slate-600">{item.plan || "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{typeof item.credits === "number" ? item.credits.toLocaleString() : "—"}</td>
                      <td className="px-6 py-4"><InfoRow label="" value={item.isActive === true ? "Active" : item.isActive === false ? "Inactive" : "Unavailable"} tone={item.isActive ? "green" : "gray"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Service activity" subtitle="Requests counted by the admin statistics endpoint">
          <div className="space-y-1 px-5 py-3 sm:px-6">
            <AdminMetric label="AI chat requests" value={stats?.aiChatRequests} loading={loading} />
            <AdminMetric label="Resume requests" value={stats?.resumeRequests} loading={loading} />
          </div>
          <div className="mx-5 mb-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 sm:mx-6">
            Admin APIs provide read-only summaries here. User management actions are not exposed in this interface.
          </div>
        </Panel>
      </div>
    </>
  );
}

function AdminMetric({ label, value, loading }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{loading ? "…" : typeof value === "number" ? value.toLocaleString() : "Unavailable"}</span>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/app" : "/login"} replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="generator" element={<GeneratorPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/app/admin" element={<AppShell />}><Route index element={<AdminPage />} /></Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? "/app" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
