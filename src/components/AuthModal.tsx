import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  Chrome,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, role: string) => void;
  isForceWelcome?: boolean;
  onContinueAsGuest?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  isForceWelcome = false,
  onContinueAsGuest
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const bootstrappedEmails = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];

  const handleAuthError = (err: any) => {
    console.error("Auth error details:", err);
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      setError("Invalid email or password combination.");
    } else if (err.code === "auth/email-already-in-use") {
      setError("This email address is already registered.");
    } else if (err.code === "auth/weak-password") {
      setError("Password should be at least 6 characters.");
    } else if (err.code === "auth/invalid-email") {
      setError("Please provide a valid email address.");
    } else {
      setError(err.message || "An error occurred during authentication.");
    }
  };

  const syncUserWorkspace = async (fbUser: any) => {
    if (!fbUser) return "User";
    
    const userRef = doc(db, "users", fbUser.uid);
    let assignedRole = "User";

    if (fbUser.email && bootstrappedEmails.includes(fbUser.email.trim().toLowerCase())) {
      assignedRole = "Super Admin";
    }

    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.status === "Suspended") {
          throw new Error("This account has been suspended by the administrator.");
        }
        return existingData.role || "User";
      } else {
        const profileObj = {
          id: fbUser.uid,
          name: fullName || fbUser.displayName || fbUser.email?.split("@")[0] || "Guest patron",
          email: fbUser.email,
          role: assignedRole,
          status: "Active",
          addedAt: new Date().toISOString()
        };
        await setDoc(userRef, profileObj);
        return assignedRole;
      }
    } catch (e: any) {
      console.warn("Firestore syncing error, using client persistence fallback:", e);
      return assignedRole;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const checkEmail = email.trim().toLowerCase();

    // INTERCEPT: Demo / Preview Login
    if (checkEmail === "admin@gmail.com") {
      if (password === "admin1234") {
        const mockUser = {
          uid: "demo_admin",
          email: "admin@gmail.com",
          displayName: "Demo Admin",
          isMock: true
        };
        localStorage.setItem("ona_mock_user", JSON.stringify(mockUser));
        localStorage.setItem("ona_mock_role", "Super Admin");
        
        setSuccessMsg("Welcome, Admin! Accessing Ona Cabin in Demo Mode.");
        setTimeout(() => {
          onAuthSuccess(mockUser, "Super Admin");
          onClose();
          setLoading(false);
        }, 1200);
        return;
      } else {
        setError("Invalid password for Demo Admin.");
        setLoading(false);
        return;
      }
    }

    const savedMockUsers = localStorage.getItem("ona_mock_users_db");
    const usersList = savedMockUsers ? JSON.parse(savedMockUsers) : [];

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please provide your full name for the reservation ledger.");
        setLoading(false);
        return;
      }

      const existing = usersList.find((u: any) => u.email === checkEmail);
      if (existing) {
        setError("This email address is already registered.");
        setLoading(false);
        return;
      }

      const newUser = {
        fullName,
        email: checkEmail,
        password,
        role: "User",
        addedAt: new Date().toISOString()
      };
      usersList.push(newUser);
      localStorage.setItem("ona_mock_users_db", JSON.stringify(usersList));

      const mockUser = {
        uid: "mock_" + fullName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
        email: checkEmail,
        displayName: fullName,
        isMock: true
      };
      localStorage.setItem("ona_mock_user", JSON.stringify(mockUser));
      localStorage.setItem("ona_mock_role", "User");

      setSuccessMsg(`Welcome, ${fullName}! Account created successfully (Demo Mode).`);
      setTimeout(() => {
        onAuthSuccess(mockUser, "User");
        onClose();
        setLoading(false);
      }, 1200);
    } else {
      const matched = usersList.find((u: any) => u.email === checkEmail && u.password === password);
      if (matched) {
        const mockUser = {
          uid: "mock_" + matched.fullName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
          email: checkEmail,
          displayName: matched.fullName,
          isMock: true
        };
        localStorage.setItem("ona_mock_user", JSON.stringify(mockUser));
        localStorage.setItem("ona_mock_role", matched.role || "User");

        setSuccessMsg(`Welcome back, ${matched.fullName}!`);
        setTimeout(() => {
          onAuthSuccess(mockUser, matched.role || "User");
          onClose();
          setLoading(false);
        }, 1200);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        const role = await syncUserWorkspace(fbUser);
        
        setSuccessMsg("Welcome back to La Maison Ona.");
        setTimeout(() => {
          onAuthSuccess(fbUser, role);
          onClose();
        }, 1200);
      } catch (e: any) {
        handleAuthError(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;
      const role = await syncUserWorkspace(fbUser);

      setSuccessMsg("Welcome to the Ona Society.");
      setTimeout(() => {
        onAuthSuccess(fbUser, role);
        onClose();
      }, 1200);
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (!email.trim()) {
      setError("Please provide your email address to recover credentials.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg("Reset instructions dispatched! Please check your email inbox.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg("");
      }, 5000);
    } catch (e: any) {
      console.error(e);
      if (e.code === "auth/user-not-found") {
        setError("No account associated with this email was found.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(e.message || "Failed to transmit password reset instructions.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isForceWelcome ? onClose : undefined}
          className="absolute inset-0 bg-[#050505]/85 backdrop-blur-md"
        />

        {/* Dual-Column Modal Wrapper Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#0b0b0b] border border-gold-400/20 text-[#fbf9f4] overflow-hidden rounded-md shadow-2xl z-10 md:grid md:grid-cols-12 max-h-[92vh] md:h-[620px] flex flex-col"
        >
          {/* Aesthetic background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-300/3 blur-3xl rounded-full pointer-events-none" />

          {/* Close trigger - Hides completely if forced onboarding welcome is active */}
          {!isForceWelcome && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gold-300 transition-colors p-1.5 border border-white/5 bg-black/40 hover:bg-black rounded-full cursor-pointer z-20"
              aria-label="Close welcome screen"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* COLUMN 1: CINEMATIC WELCOME ONBOARDING (Left 5-cols on desktop) */}
          <div className="md:col-span-5 hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-[#1c140c] via-[#0b0b0b] to-[#120e0a] relative overflow-hidden h-full border-r border-gold-400/10">
            {/* Background image draping the layout inside */}
            <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80')` }} />
            
            <div className="space-y-6 relative z-10 text-left">
              <div className="space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold-400 font-semibold block">La Maison Ona</span>
                <h2 className="font-serif text-3xl font-light text-white tracking-wide uppercase leading-tight">
                  Ona Lagos
                </h2>
              </div>
              <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
                A high design fine-dining sanctuary in Victoria Island, Nigeria. Marrying sub-Saharan ancestral heritage with the high theater of modern gastronomy.
              </p>
              
              {/* Premium Bullet Features list */}
              <div className="space-y-4 pt-4 border-t border-gold-400/10 font-sans text-xs font-light text-gray-300">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span><strong>Society Curation</strong>: Secure private reservation vaults, custom heat profiles, and romantic cellars.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span><strong>Lifestyle Catalog</strong>: Direct access to artisanal hand-carved mahogany boards and scent leaf candles.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span><strong>SaaS CMS Manager</strong>: High-fidelity cosmetic customizers without touching code.</span>
                </div>
              </div>
            </div>

            {/* Quote details */}
            <div className="relative z-10 text-left pt-6 border-t border-gold-400/10 font-serif italic text-xs text-gold-300/80 leading-relaxed font-light">
              "Every detail meticulously forged to leave a lasting Edo mark upon your dining generation."
            </div>
          </div>

          {/* COLUMN 2: PREMIUM AUTHENTICATION FORM (Right 7-cols on desktop) */}
          <div className="md:col-span-7 flex flex-col justify-between p-8 overflow-y-auto w-full h-full relative z-10">
            <div className="my-auto space-y-6">
              {/* Title Header */}
              <div className="text-center md:text-left space-y-1">
                <h3 className="font-serif text-2xl tracking-[0.2em] font-light uppercase text-[#fbf9f4]">
                  Ona <span className="text-gold-400 font-sans text-xs align-super ml-0.5 font-normal tracking-widest">Society</span>
                </h3>
                <p className="font-sans text-xs text-gray-400 font-light">
                  {isForgotPassword 
                    ? "Restore access to your secure portal."
                    : isSignUp
                      ? "Create account to access catalogs, reserves, and details."
                      : "Credential Gateway for members, hosts, and sommeliers."
                  }
                </p>
              </div>

              {/* Status Feedbacks */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 text-xs flex items-start gap-2 rounded-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 text-xs flex items-center gap-2 rounded-sm font-serif italic"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* DYNAMIC FORMS MOUNT */}
              {isForgotPassword ? (
                /* FORGOT PASSWORD FORM */
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@onalagos.com"
                        className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 cursor-pointer bg-gold-500 hover:bg-gold-600 disabled:bg-gold-800 disabled:text-gray-400 text-black py-3 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-md"
                    >
                      {resetLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Send Instructions</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="cursor-pointer bg-transparent border border-white/10 hover:border-gold-400 hover:text-white py-3 px-5 text-gray-400 text-xs font-sans uppercase tracking-wider transition-colors rounded-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN IN / SIGN UP FORM */
                <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-semibold">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                          required
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Chief Adeleke Williams"
                          className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors rounded-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@onalagos.com"
                        className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-semibold">
                        Password
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => { setIsForgotPassword(true); setError(""); }}
                          className="font-sans text-[10px] text-gold-300 hover:text-white cursor-pointer hover:underline underline-offset-2 transition-colors focus:outline-none"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors rounded-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 cursor-pointer bg-gold-500 hover:bg-gold-600 disabled:bg-gold-800 disabled:text-gray-400 text-black py-3.5 font-sans text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-[0_4px_15px_rgba(181,137,75,0.2)]"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LockKeyhole className="w-3.5 h-3.5" />
                        <span>{isSignUp ? "Create Account" : "Access Sanctuary"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Social Login and Divider */}
              {!isForgotPassword && (
                <>
                  <div className="relative my-5 text-center">
                    <span className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
                    <span className="relative bg-[#0b0b0b] px-3 font-sans text-[10px] uppercase tracking-[0.2em] text-gray-600 block w-max mx-auto">
                      Or Social Credentials
                    </span>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-white/5 border border-white/10 py-2.5 text-xs font-sans tracking-wider hover:text-white transition-colors cursor-pointer rounded-sm font-semibold"
                  >
                    <Chrome className="w-4 h-4 text-gold-300" />
                    <span>Sign in with Google Account</span>
                  </button>
                </>
              )}

              {/* GUEST CURATION ACCELERATOR button */}
              {isForceWelcome && onContinueAsGuest && (
                <div className="pt-2">
                  <button
                    onClick={onContinueAsGuest}
                    className="w-full text-center py-2.5 border border-dashed border-gold-400/20 hover:border-gold-400/60 bg-gold-400/5 hover:bg-gold-400/10 text-gold-300 text-xs font-sans uppercase tracking-[0.18em] transition-all cursor-pointer rounded-sm"
                  >
                    Continue as Guest &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Signin/Signup */}
            {!isForgotPassword && (
              <div className="mt-8 text-center border-t border-white/5 pt-4">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="font-sans text-[11px] text-gray-500 hover:text-gold-300 cursor-pointer underline underline-offset-4 focus:outline-none transition-colors"
                >
                  {isSignUp
                    ? "Already configured with credentials? Log In"
                    : "Don't have an Ona credential? Register for access"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
