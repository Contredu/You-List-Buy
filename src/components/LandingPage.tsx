import React, { useState } from "react";
import {
  ShoppingCart,
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Store,
  BarChart3,
  Bell,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Check,
  Smartphone,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface LandingPageProps {
  onExploreDemo: () => void;
  inviteCodeFromUrl?: string | null;
  onSuccessAuth: () => void;
  onShowToast: (msg: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreDemo,
  inviteCodeFromUrl,
  onSuccessAuth,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onShowToast("¡Bienvenido! Sesión iniciada correctamente.");
      onSuccessAuth();
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setAuthError("Inicio de sesión cancelado en la ventana emergente.");
      } else {
        setAuthError(
          "Error al autenticar con Google. Verifica tu conexión o intenta con correo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Submit
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      if (authMode === "register") {
        if (password.length < 6) {
          setAuthError("La contraseña debe tener al menos 6 caracteres.");
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim() && userCred.user) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
        onShowToast("¡Cuenta familiar creada con éxito!");
        onSuccessAuth();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onShowToast("¡Sesión iniciada con éxito!");
        onSuccessAuth();
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/email-already-in-use") {
        setAuthError("Ya existe una cuenta registrada con este correo. Prueba a iniciar sesión.");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("El formato de correo electrónico no es válido.");
      } else if (error.code === "auth/operation-not-allowed") {
        setAuthError(
          "El acceso por contraseña aún no está habilitado en este proyecto. Por favor utiliza el botón 'Continuar con Google'."
        );
      } else {
        setAuthError(error.message || "Error al autenticar usuario.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-lg tracking-tight">
                Despensa & Compras
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Familiar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-explore-demo-top-btn"
              onClick={onExploreDemo}
              className="px-3.5 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Explorar Demo
            </button>
            <button
              id="landing-signin-top-btn"
              onClick={() => {
                setAuthMode("login");
                document.getElementById("auth-card-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200 bg-linear-to-b from-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {inviteCodeFromUrl && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Invitación detectada: Unirte a la sesión {inviteCodeFromUrl}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sesión Familiar en Tiempo Real</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-stone-950 tracking-tight leading-tight">
                Una única lista de compra para todo el hogar.{" "}
                <span className="text-emerald-700 block mt-1">
                  Sin duplicados ni listas separadas.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Invita a tu pareja, hijos o convivientes a la misma sesión de compra. Cuando alguien añade o tacha un producto en el supermercado, se refleja al instante en los móviles de todos.
              </p>

              {/* Key Quick Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Misma lista compartida con 1 solo código</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alertas automáticas de stock mínimo</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Modo supermercado rápido para el pasillo</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Control de presupuesto y comparador</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Auth Card */}
            <div id="auth-card-section" className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
                {/* Auth Mode Toggle Tabs */}
                <div className="grid grid-cols-2 border-b border-stone-200 text-center font-semibold text-sm">
                  <button
                    id="tab-login-btn"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError(null);
                    }}
                    className={`py-3.5 transition-colors cursor-pointer ${
                      authMode === "login"
                        ? "border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/40"
                        : "text-stone-500 hover:text-stone-800 bg-stone-50"
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    id="tab-register-btn"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError(null);
                    }}
                    className={`py-3.5 transition-colors cursor-pointer ${
                      authMode === "register"
                        ? "border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/40"
                        : "text-stone-500 hover:text-stone-800 bg-stone-50"
                    }`}
                  >
                    Crear Cuenta
                  </button>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  {/* Google 1-Click Button (Primary Recommendation) */}
                  <div>
                    <button
                      id="google-signin-main-btn"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm transition-all shadow-xs cursor-pointer"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {authMode === "login"
                          ? "Continuar con Google (1 clic)"
                          : "Registrarme con Google (1 clic)"}
                      </span>
                    </button>
                    <p className="text-[11px] text-stone-400 text-center mt-1.5">
                      Recomendado para sincronizar Carlos, Juana y Noelia
                    </p>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-stone-200" />
                    <span className="text-xs uppercase font-medium text-stone-400">
                      o con correo
                    </span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                    {authMode === "register" && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Tu Nombre o Rol Familiar
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            id="auth-name-input"
                            type="text"
                            placeholder="ej. Carlos o Juana"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          id="auth-email-input"
                          type="email"
                          required
                          placeholder="tu.correo@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          id="auth-password-input"
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
                        {authError}
                      </div>
                    )}

                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>
                        {loading
                          ? "Procesando..."
                          : authMode === "login"
                          ? "Iniciar Sesión"
                          : "Crear Cuenta Familiar"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Explore Demo Mode Link */}
                  <div className="pt-2 text-center border-t border-stone-100">
                    <button
                      id="auth-guest-demo-btn"
                      onClick={onExploreDemo}
                      className="text-xs text-stone-500 hover:text-stone-800 hover:underline font-medium cursor-pointer"
                    >
                      ¿Prefieres explorar primero? Entrar en Modo Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Diseñado específicamente para compras en familia
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Todo lo que necesitas para coordinar la despensa doméstica sin confusiones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                1. Sesión Compartida Única
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Invita con un código único de 6 dígitos a cualquier persona de la casa. Todos ven el mismo inventario y la misma lista activa, eliminando la creación accidental de listas independientes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                2. Modo Supermercado Ágil
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Tacha artículos con una sola mano mientras caminas por los pasillos. Cada producto tachado por un familiar se marca en verde al instante en el móvil de los demás.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                3. Presupuesto & Precios
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Monitorea el gasto acumulado del mes contra el presupuesto fijado. Guarda precios de Mercadona, Carrefour o Lidl para saber siempre dónde conviene comprar cada producto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-stone-100 border-t border-stone-200 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-800">
              Despensa & Compras Familiar
            </span>
          </div>
          <p>Sincronización en la nube con Firestore y Google Authentication</p>
        </div>
      </footer>
    </div>
  );
};
