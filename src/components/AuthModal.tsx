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
  LockKeyhole
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, role: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

    // Auto-promote bootstrapped email as Super Admin
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
        // Create new user profile in secure database
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
      // Fallback for missing database permissions during setup
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

    // INTERCEPT: Demo / Frontend Preview Login
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

    // Intercept: Local Mock Users registration and login
    const savedMockUsers = localStorage.getItem("ona_mock_users_db");
    const usersList = savedMockUsers ? JSON.parse(savedMockUsers) : [];

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please provide your full name for the reservation ledger.");
        setLoading(false);
        return;
      }

      // Check if email already registered in mock DB
      const existing = usersList.find((u: any) => u.email === checkEmail);
      if (existing) {
        setError("This email address is already registered.");
        setLoading(false);
        return;
      }

      // Save to mock users DB
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
      // Find in mock database
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

      // Fallback for real firebase users
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#0b0b0b] border border-gold-400/20 text-[#fbf9f4] p-8 overflow-hidden rounded-none shadow-[0_10px_50px_rgba(181,137,75,0.15)] z-10"
        >
          {/* Scent Leaf Aesthetic background glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gold-400/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-gold-300/3 blur-3xl rounded-full pointer-events-none" />

          {/* Close Trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gold-300 transition-colors p-1"
            aria-label="Close credentials screen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading Logo */}
          <div className="text-center space-y-2 mb-8 mt-2">
            <h3 className="font-serif text-2xl tracking-[0.2em] font-light">
              ONA<span className="text-gold-400 font-sans text-xs align-super ml-0.5 font-normal">SOCIETY</span>
            </h3>
            <p className="font-sans text-xs text-gray-400 font-light">
              {isSignUp
                ? "Register below to secure fine dining, private requests, and reservation leads."
                : "Credential Gateway for members, hosts, and sommeliers."}
            </p>
          </div>

          {/* Standard Status Indicators */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-xs flex items-start gap-2 mb-6"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 text-xs flex items-center gap-2 mb-6 font-serif italic"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Demo Admin Quick Access Indicator Box */}
          <div className="mb-6 p-4 bg-gold-400/5 border border-gold-400/20 text-left">
            <div className="flex items-center gap-1.5 text-gold-300 font-serif text-xs mb-1 uppercase tracking-widest font-normal">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Frontend Preview Login</span>
            </div>
            <p className="font-sans text-[11px] text-gray-400 font-light leading-relaxed mb-3">
              This application has real-time offline persistence capability. Gain unrestricted admin customizer access instantly by using the credentials below:
            </p>
            <div className="space-y-1 font-mono text-[10px] text-gray-300 mb-3 bg-black/40 p-2.5 border border-white/5">
              <div>Email: <span className="text-gold-400">admin@gmail.com</span></div>
              <div>Password: <span className="text-gold-400">admin1234</span></div>
            </div>
            <button
              onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("admin1234");
                setIsSignUp(false);
              }}
              type="button"
              className="w-full bg-[#181818] border border-gold-400/30 hover:bg-[#222] text-gold-300 text-[10px] uppercase tracking-widest py-1.5 transition-colors cursor-pointer text-center font-sans font-medium"
            >
              Autofill Demo Credentials
            </button>
          </div>

          {/* Formal Form Submit */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5 text-left">
                <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-medium">
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
                    className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-medium">
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
                  className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colorsAll"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="block font-sans text-[10px] uppercase tracking-widest text-gold-300 font-medium">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gold-400 text-[#fbf9f4] placeholder:text-gray-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 cursor-pointer bg-gold-500 hover:bg-gold-600 disabled:bg-gold-800 disabled:text-gray-400 text-black py-3 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(181,137,75,0.15)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LockKeyhole className="w-3.5 h-3.5" />
                  <span>{isSignUp ? "Create Account" : "Access Cabin"}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5" />
            <span className="relative bg-[#0b0b0b] px-3 font-sans text-[10px] uppercase tracking-widest text-gray-600">
              Or Social Credentials
            </span>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-white/5 border border-white/10 py-2.5 text-xs font-sans tracking-wider hover:text-white transition-colors cursor-pointer"
          >
            <Chrome className="w-4 h-4 text-gold-300" />
            <span>Sign in with Google Account</span>
          </button>

          {/* Toggle Gateway */}
          <div className="mt-8 text-center">
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

          {/* Bootstrapped Super Admin Highlight */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center flex items-center justify-center gap-1.5 text-[10px] text-gold-400/50">
            <Sparkles className="w-3 h-3" />
            <span>Default Super-Admin mapping: officialdananj@gmail.com</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
