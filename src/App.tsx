import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  ArrowRight,
  Clock,
  Sparkles,
  Instagram,
  MapPin,
  GlassWater,
  Phone,
  ShieldCheck,
  ChefHat,
  Wine,
  Send,
  Info,
  CheckCircle,
  Award,
  Flame,
  User,
  Star,
  MessageSquare
} from "lucide-react";

// Types & Data
import { MENU_ITEMS, GALLERY_ITEMS, TESTIMONIALS, OPENING_HOURS } from "./types";

// Page/Tab Views
import HomeSections from "./components/HomeSections";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutView from "./components/AboutView";
import MenuView from "./components/MenuView";
import KidsDietaryView from "./components/KidsDietaryView";
import PrivateDiningView from "./components/PrivateDiningView";
import GalleryView from "./components/GalleryView";
import ContactView from "./components/ContactView";
import BackgroundMusic from "./components/BackgroundMusic";
import ReservationModal from "./components/ReservationModal";
import ExploreLegacyWidget from "./components/ExploreLegacyWidget";
import OnaLifestyleView from "./components/OnaLifestyleView";
import AdminDashboard from "./components/AdminDashboard";

// Firebase Context Imports
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { DEFAULT_CMS } from "./components/WebsiteCustomizer";
import AuthModal from "./components/AuthModal";

// Convex Hooks & Client
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { convexClient } from "./convexClient";


export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [cms, setCms] = useState<any>(() => {
    const saved = localStorage.getItem("ona_mock_cms_config");
    return saved ? JSON.parse(saved) : DEFAULT_CMS;
  });
  const [initialLoading, setInitialLoading] = useState(true);

  // Convex Client hooks for CMS and User updates
  const convexCms = useQuery(api.settings.getByKey, { key: "cms_config" });
  const upsertProfile = useMutation(api.users.upsertProfile);

  // Favicon, Title and Load Animation timer
  useEffect(() => {
    if (cms?.branding?.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = cms.branding.favicon;
    }
    if (cms?.seo?.pageTitle) {
      document.title = cms.seo.pageTitle;
    }
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [cms]);

  useEffect(() => {
    // Sync with localStorage event updater
    const handleCmsUpdateEvent = () => {
      const savedCms = localStorage.getItem("ona_mock_cms_config");
      if (savedCms) {
        setCms(JSON.parse(savedCms));
      }
    };
    window.addEventListener("ona_cms_updated", handleCmsUpdateEvent);

    if (convexCms && convexCms.success && convexCms.data) {
      const data = convexCms.data;
      const merged = {
        ...DEFAULT_CMS,
        ...data,
        branding: { ...DEFAULT_CMS.branding, ...(data.branding || {}) },
        colors: { ...DEFAULT_CMS.colors, ...(data.colors || {}) },
        typography: { ...DEFAULT_CMS.typography, ...(data.typography || {}) },
        hero: { ...DEFAULT_CMS.hero, ...(data.hero || {}) },
        homepageSections: data.homepageSections || DEFAULT_CMS.homepageSections,
        navigation: { ...DEFAULT_CMS.navigation, ...(data.navigation || {}) },
        socials: { ...DEFAULT_CMS.socials, ...(data.socials || {}) },
        contact: { ...DEFAULT_CMS.contact, ...(data.contact || {}) },
      };
      setCms(merged);
      localStorage.setItem("ona_mock_cms_config", JSON.stringify(merged));
    }

    return () => {
      window.removeEventListener("ona_cms_updated", handleCmsUpdateEvent);
    };
  }, [convexCms]);

  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState("Standard Dining");
  const [dbKey, setDbKey] = useState(0);

  const [previewMode, setPreviewMode] = useState<"published" | "draft">(() => {
    const saved = localStorage.getItem("ona_preview_mode");
    return (saved === "draft" || saved === "published") ? saved : "draft";
  });

  useEffect(() => {
    const handlePreviewChange = () => {
      const saved = localStorage.getItem("ona_preview_mode");
      if (saved === "draft" || saved === "published") {
        setPreviewMode(saved);
      }
    };
    window.addEventListener("ona_preview_mode_changed", handlePreviewChange);
    return () => window.removeEventListener("ona_preview_mode_changed", handlePreviewChange);
  }, []);

  const handleTogglePreviewMode = (mode: "published" | "draft") => {
    localStorage.setItem("ona_preview_mode", mode);
    setPreviewMode(mode);
    window.dispatchEvent(new Event("ona_preview_mode_changed"));
  };
  
  // Local Mock State OR Firebase Auth State Tracking
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("ona_mock_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [userRole, setUserRole] = useState<string>(() => {
    const saved = localStorage.getItem("ona_mock_role");
    return saved || "User";
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSigned, setNewsletterSigned] = useState(false);

  // Auto scroll to top on tab modification
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab]);

  // Subscribe to Authentication State
  useEffect(() => {
    const savedMockUser = localStorage.getItem("ona_mock_user");
    if (savedMockUser) {
      const parsed = JSON.parse(savedMockUser);
      setCurrentUser(parsed);
      const savedMockRole = localStorage.getItem("ona_mock_role") || "User";
      setUserRole(savedMockRole);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (localStorage.getItem("ona_mock_user")) return; // Skip if mock is active
      
      setCurrentUser(fbUser);
      if (fbUser) {
        // Set Convex authentication token
        convexClient.setAuth(async () => {
          return await fbUser.getIdToken();
        });

        // Sync profile to Convex
        try {
          await upsertProfile({ name: fbUser.displayName || fbUser.email?.split("@")[0] || "User" });
        } catch (err) {
          console.warn("Failed to sync profile to Convex:", err);
        }

        // Retrieve custom roles from users collection or bootstrapped rules
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserRole(snap.data().role || "User");
          } else {
            const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
            if (fbUser.email && bootstrapped.includes(fbUser.email.trim().toLowerCase())) {
              setUserRole("Super Admin");
            } else {
              setUserRole("User");
            }
          }
        } catch (e) {
          console.warn("Could not retrieve Firestore user document:", e);
          const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
          if (fbUser.email && bootstrapped.includes(fbUser.email.trim().toLowerCase())) {
            setUserRole("Super Admin");
          } else {
            setUserRole("User");
          }
        }
      } else {
        // Clear Convex authentication
        convexClient.clearAuth();
        setUserRole("User");
      }
    });
    return () => unsubscribe();
  }, []);

  // Protect Admin Dashboard Routes
  useEffect(() => {
    const adminRoles = ["Super Admin", "Admin", "Manager", "Content Editor", "Reservation Staff"];
    if (currentTab === "admin" && !adminRoles.includes(userRole)) {
      setAuthModalOpen(true);
      setCurrentTab("home");
    }
  }, [currentTab, userRole]);

  const handleOpenReservation = (type = "Standard Dining") => {
    setReservationType(type);
    setIsReservationOpen(true);
  };

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSigned(true);
    }
  };

  // Mock Instagram Feed Data for the homepage (Lagos society vibe)
  const instagramFeed = [
    {
      id: "i1",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80",
      likes: "1,248 likes",
      caption: "Sautéed botanical scent leaf rum infusions over solid carved ice. Unmissable sunset sips at Ona. #OnaLagos #VILife",
      user: "lagos_shaker_co"
    },
    {
      id: "i2",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
      likes: "3,110 likes",
      caption: "A wood-fire kiss on our dry-aged Ribeye. Finished with house-charred dodo and marrow jus. #ArtOfSuya #AfricanGastronomy",
      user: "chef_ade_cuisine"
    },
    {
      id: "i3",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80",
      likes: "2,045 likes",
      caption: "Our Grand Main Saloon draped in golden hour. High mud structures inspired by traditional earth weavers. #LaMaisonOna",
      user: "vogue_hospitality"
    },
    {
      id: "i4",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=80",
      likes: "942 likes",
      caption: "Traditional Agege bread butter pudding with wild honeycomb and ginger-infused white chocolate. #SignatureDessert #OnaSweet",
      user: "gourmet_goddess"
    },
    {
      id: "i5",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80",
      likes: "1,870 likes",
      caption: "Epitome of Lagos high society. Toasting to new beginnings in our private gothic wine cellar room. #OnaMoments",
      user: "noble_noble_1"
    },
    {
      id: "i6",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80",
      likes: "2,490 likes",
      caption: "Atlantic Charcoal Prawn Platter served over wilted native greens. Taste the ocean. #OceanHarvest #OnaVictoriaIsland",
      user: "culinary_critic_ng"
    }
  ];

  return (
    <div className="bg-[#050505] text-[#fbf9f4] font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-gold-500 selection:text-black">
      <AnimatePresence>
        {initialLoading && (
          <motion.div
            key="splash-screen"
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center text-[#fbf9f4] h-screen w-screen overflow-hidden"
            style={{ backgroundColor: cms?.colors?.backgroundColor || "#050505" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center max-w-xs px-6 text-center space-y-6"
            >
              {cms?.branding?.loadingLogoUrl || cms?.branding?.logoUrl ? (
                <img
                  src={cms.branding.loadingLogoUrl || cms.branding.logoUrl}
                  alt={cms?.branding?.brandName || "ONA LAGOS"}
                  referrerPolicy="no-referrer"
                  className="h-16 md:h-20 w-auto object-contain animate-pulse"
                />
              ) : (
                <div className="space-y-2 text-center">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] block" style={{ color: cms?.colors?.goldAccent || "#C5A070" }}>
                    {cms?.branding?.brandName?.split(" ")[0] || "ONA"}
                  </span>
                  <span className="text-gray-500 font-sans text-xs tracking-[0.4em] uppercase block">
                    {cms?.branding?.brandName?.split(" ").slice(1).join(" ") || "LAGOS"}
                  </span>
                </div>
              )}
              
              {/* Elegant dynamic loader bar */}
              <div className="w-16 h-[1px] bg-gold-400/20 relative overflow-hidden">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-y-0 w-8"
                  style={{ backgroundColor: cms?.colors?.goldAccent || "#C5A070" }}
                />
              </div>
              
              <p className="text-[10px] uppercase font-sans tracking-[0.3em] text-gray-500 font-light">
                {cms?.branding?.tagline || "Marked by culture. Refined by experience."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cms && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --cms-bg-color: ${cms.colors?.backgroundColor || "#050505"};
            --cms-primary-color: ${cms.colors?.primaryColor || "#FAF6F0"};
            --cms-accent-color: ${cms.colors?.accentColor || "#A89C8F"};
            --cms-panel-color: ${cms.colors?.panelColor || "#FCFAF5"};
            --cms-gold-accent: ${cms.colors?.goldAccent || "#C5A070"};
            --cms-font-heading: "${cms.typography?.headingFont || 'Cormorant Garamond'}", serif;
            --cms-font-body: "${cms.typography?.bodyFont || 'Plus Jakarta Sans'}", sans-serif;
          }
          
          body, .font-sans {
            font-family: var(--cms-font-body) !important;
          }
          
          h1, h2, h3, h4, h5, h6, .font-serif {
            font-family: var(--cms-font-heading) !important;
            ${cms.typography?.uppercaseHeadings ? "text-transform: uppercase !important; letter-spacing: 0.15em !important;" : ""}
          }
          
          .bg-root-custom {
            background-color: var(--cms-bg-color) !important;
          }
          
          /* Custom overrides of colors across existing layout elements */
          .text-gold-300, .text-gold-400 {
            color: var(--cms-gold-accent) !important;
          }
          .bg-gold-500, .hover\\:bg-gold-600:hover {
            background-color: var(--cms-gold-accent) !important;
            color: var(--cms-bg-color) !important;
          }
          .border-gold-400\\/10, .border-gold-400\\/20, .border-gold-400\\/25 {
            border-color: rgba(197, 160, 112, 0.15) !important;
          }
        `}} />
      )}
      
      {/* 0. VIEW SWITCHER / REVERSE PROXIED PRIVILEGE BAR */}
      {(userRole === "Super Admin" || userRole === "Admin") && (
        <div className="bg-gradient-to-r from-[#111] via-[#1a140f] to-[#111] border-b border-gold-400/25 px-6 py-3 text-xs flex flex-col sm:flex-row justify-between items-center gap-3 relative z-50 text-[#fbf9f4] shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f5be6b] animate-pulse" />
            <span className="font-sans font-light text-gray-400">
              Active Session: <strong className="text-gold-300 font-medium font-sans">{userRole}</strong> ({currentUser?.email})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab("home")}
              className={`px-3 py-1 font-sans text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                currentTab !== "admin"
                  ? "bg-gold-500 text-black font-semibold"
                  : "border border-gold-400/20 text-gold-300 hover:bg-gold-500/10"
              }`}
            >
              View Website
            </button>
            <button
              onClick={() => setCurrentTab("admin")}
              className={`px-3 py-1 font-sans text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                currentTab === "admin"
                  ? "bg-gold-500 text-black font-semibold"
                  : "border border-gold-400/20 text-gold-300 hover:bg-gold-500/10"
              }`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={async () => {
                localStorage.removeItem("ona_mock_user");
                localStorage.removeItem("ona_mock_role");
                try {
                  await signOut(auth);
                } catch (e) {
                  console.warn(e);
                }
                setCurrentUser(null);
                setUserRole("User");
                setCurrentTab("home");
              }}
              className="px-2.5 py-1 text-red-400 hover:text-red-300 transition-colors font-sans text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Premium Sticky Navigation */}
      {currentTab !== "admin" && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenReservation={() => handleOpenReservation("Standard Dining")}
          cms={cms}
        />
      )}

      {/* Main Container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentTab === "home" && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 1. CINEMATIC HERO SECTION */}
              <Hero
                onOpenReservation={() => handleOpenReservation("Standard Dining")}
                onViewMenu={() => setCurrentTab("menu")}
                cms={cms}
              />

              {/* DYNAMIC CMS-DRIVEN HOME SECTIONS LIST */}
              <HomeSections
                cms={cms}
                setCurrentTab={setCurrentTab}
                handleOpenReservation={handleOpenReservation}
                DEFAULT_CMS={DEFAULT_CMS}
              />

              {/* LOCATION & HOURS (Home page final section block) */}
              <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left border-t border-white/5 bg-root-custom text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <h4 className="font-serif text-xl font-light text-[#fbf9f4]">The Address</h4>
                  </div>
                  <p className="font-sans text-xs text-gray-400 font-light leading-relaxed pl-6">
                    Plot 14, Ademola Adetokunbo Street, <br />
                    Victoria Island, Lagos, Nigeria. <br />
                    <span className="text-gold-400">Standard valet services provided directly.</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-400" />
                    <h4 className="font-serif text-xl font-light text-[#fbf9f4]">Weekly Rhythm</h4>
                  </div>
                  <p className="font-sans text-xs text-gray-400 font-light leading-relaxed pl-6">
                    Tues & Thurs: 12:30 PM - 11:00 PM <br />
                    Wednesdays: Closed (No Operations) <br />
                    Fridays: 12:30 PM - Midnight <br />
                    Saturdays: 11:00 AM - Midnight <br />
                    Sundays: 11:00 AM - 10:30 PM <br />
                    Mondays: Private Curator Bookings only.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold-400" />
                    <h4 className="font-serif text-xl font-light text-[#fbf9f4]">Direct Connection</h4>
                  </div>
                  <p className="font-sans text-xs text-gray-400 font-light leading-relaxed pl-6">
                    Concierge Voice: <a href="tel:+2348000ONALAGOS" className="text-gold-300 hover:underline">+234 (0) 90 ONA LAGOS</a> <br />
                    Direct Concierge: <a href="mailto:concierge@onalagos.com" className="text-gold-300 hover:underline">concierge@onalagos.com</a> <br />
                    WhatsApp Gateway: <a href="https://wa.me/23490000000" className="text-gold-300 hover:underline">+234 90 6000 ONA</a>
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {currentTab === "about" && (
            <motion.div
              key="about-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <AboutView onOpenReservation={() => handleOpenReservation("Standard Dining")} />
            </motion.div>
          )}

          {currentTab === "menu" && (
            <motion.div
              key="menu-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <MenuView onOpenReservation={() => handleOpenReservation("Standard Dining")} />
            </motion.div>
          )}

          {currentTab === "kids-dietary" && (
            <motion.div
              key="family-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <KidsDietaryView
                onOpenReservation={() => handleOpenReservation("Sunday Roast")}
                onViewMenu={() => setCurrentTab("menu")}
              />
            </motion.div>
          )}

          {currentTab === "events" && (
            <motion.div
              key="events-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <PrivateDiningView onOpenReservation={() => handleOpenReservation("Private Celebration / Birthday")} />
            </motion.div>
          )}

          {currentTab === "gallery" && (
            <motion.div
              key="gallery-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <GalleryView />
            </motion.div>
          )}

          {currentTab === "ona-lifestyle" && (
            <motion.div
              key="ona-lifestyle-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <OnaLifestyleView 
                onOpenReservation={() => handleOpenReservation("Standard Dining")}
                cms={cms}
              />
            </motion.div>
          )}

          {currentTab === "contact" && (
            <motion.div
              key="contact-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <ContactView onOpenReservation={() => handleOpenReservation("Standard Dining")} />
            </motion.div>
          )}

          {currentTab === "admin" && (
            <motion.div
              key="admin-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <AdminDashboard
                onSettingsUpdate={() => setDbKey(prev => prev + 1)}
                onCloseAdmin={() => setCurrentTab("home")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MASTER LUXURY FOOTER */}
      {currentTab !== "admin" && (
        <footer id="master-footer" className="bg-[#050505] border-t border-gold-400/15 py-16 text-[#fbf9f4] relative z-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            
            {/* Col 1 Brand (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {cms?.branding?.footerLogoUrl || cms?.branding?.logoUrl ? (
                <img
                  src={cms.branding.footerLogoUrl || cms.branding.logoUrl}
                  alt={cms?.branding?.brandName || "ONA LAGOS"}
                  referrerPolicy="no-referrer"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <h3 className="font-serif text-2xl tracking-[0.2em] font-light">
                  {cms?.branding?.brandName?.split(" ")[0] || "ONA"}<span className="text-gold-400 font-sans text-xs align-super ml-1 tracking-normal">{cms?.branding?.brandName?.split(" ").slice(1).join(" ") || "LAGOS"}</span>
                </h3>
              )}
              <p className="font-sans text-xs sm:text-sm text-gray-400 font-light leading-relaxed max-w-sm">
                Ona Lagos — Modern African dining marked by culture, flavour, and experience. Located in Victoria Island, Lagos, designed to leave a lasting impression of signature hospitality.
              </p>
              <div className="flex gap-4 items-center pl-1 text-gray-500">
                <a href="https://instagram.com/ona_lagos" target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors" aria-label="Instagram Profile">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://wa.me/23490000000" target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors" aria-label="WhatsApp Message">
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2 Quick Links (2.5 cols) */}
            <div className="lg:col-span-2.5 space-y-4 text-left">
              <h4 className="font-serif text-gold-300 tracking-wider text-sm">Navigation Paths</h4>
              <div className="flex flex-col space-y-2.5 font-sans text-xs text-gray-400 font-light">
                <button onClick={() => setCurrentTab("home")} className="hover:text-white transition-colors text-left focus:outline-none cursor-pointer">La Maison</button>
                <button onClick={() => setCurrentTab("about")} className="hover:text-white transition-colors text-left focus:outline-none cursor-pointer">Our Story</button>
                <button onClick={() => setCurrentTab("menu")} className="hover:text-white transition-colors text-left focus:outline-none cursor-pointer">The Menu</button>
                <button onClick={() => setCurrentTab("kids-dietary")} className="hover:text-white transition-colors text-left focus:outline-none cursor-pointer">Family &amp; Dietary</button>
                <button onClick={() => setCurrentTab("events")} className="hover:text-white transition-colors text-left focus:outline-none cursor-pointer">Private Dining</button>
              </div>
            </div>

            {/* Col 3 Operation hours (2.5 cols) */}
            <div className="lg:col-span-2.5 space-y-4 text-left">
              <h4 className="font-serif text-gold-300 tracking-wider text-sm">Operation Hours</h4>
              <div className="font-sans text-xs text-gray-400 space-y-2.5 font-light">
                <p>
                  <span className="text-white block font-serif text-xs">Tuesdays - Saturdays</span>
                  Lunch: 12 PM - 3 PM<br />
                  Dinner: 6 PM - 11:30 PM
                </p>
                <p>
                  <span className="text-white block font-serif text-xs">Sundays (Sunday Roast Only)</span>
                  Sunday Roast: 11:30 AM - 4 PM<br />
                  Dinner: 6 PM - 10:30 PM
                </p>
              </div>
            </div>

            {/* Col 4 Newsletter Signup (3 cols) */}
            <div className="lg:col-span-3 space-y-4 text-left">
              <h4 className="font-serif text-gold-300 tracking-wider text-sm">The Ona Society</h4>
              <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
                Register to receive seasonal menu alterations, private Afro-Jazz calendars, and Chef releases.
              </p>

              <AnimatePresence mode="wait">
                {!newsletterSigned ? (
                  <motion.form
                    onSubmit={handleNewsletterSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex border-b border-white/20 pb-1.5 pt-1.5"
                  >
                    <input
                      required
                      type="email"
                      placeholder="Enter your email"
                      className="bg-transparent text-xs text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none flex-grow w-full border-0 pr-2"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit" className="text-gold-400 hover:text-[#fbf9f4] cursor-pointer" aria-label="Subscribe">
                      <Send className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-gold-400 font-serif italic py-2"
                  >
                    <CheckCircle className="w-4 h-4 text-gold-400" />
                    <span>Emissions compiled. Welcome to Ona.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating WhatsApp and Reserve Anchor */}
          <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-sans font-light gap-4">
            <p>© 2026 Ona Lagos Hospitality Ltd. Victoria Island, Lagos. All Rights Reserved.</p>
            <div className="flex gap-6 items-center">
              <a href="https://reserve.onalagos.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">reserve.onalagos.com</a>
              <button onClick={() => setCurrentTab("contact")} className="hover:text-gold-300 cursor-pointer">Valet &amp; Directions</button>
              <button
                onClick={() => {
                  const adminRoles = ["Super Admin", "Admin", "Manager", "Content Editor", "Reservation Staff"];
                  if (adminRoles.includes(userRole)) {
                    setCurrentTab("admin");
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="hover:text-gold-400 font-medium tracking-widest uppercase cursor-pointer"
              >
                Staff Portal {currentUser ? `(${userRole})` : ""}
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* WEB AUDIO AMBIENT SOUND CONTROLLER (Procedural warm drones) */}
      <BackgroundMusic />

      {/* COHESIVE FLOATING PATHWAY / ACCESSIBILITY WIDGET */}
      {currentTab !== "admin" && (
        <ExploreLegacyWidget
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenReservation={handleOpenReservation}
        />
      )}

      {/* FLOATING REAL-TIME PREVIEW MODE SELECTOR CONTROL */}
      {currentTab !== "admin" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 z-40 font-sans"
        >
          <div className="bg-[#12110E]/95 border border-[#CBBDA9]/30 px-4 py-2.5 rounded-sm shadow-xl flex items-center gap-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${previewMode === "draft" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${previewMode === "draft" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-widest font-light uppercase">
                {previewMode === "draft" ? "Draft Preview (Real-time)" : "Live Published"}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <button
              onClick={() => handleTogglePreviewMode(previewMode === "draft" ? "published" : "draft")}
              className="text-[10px] text-gold-300 hover:text-white uppercase font-bold tracking-widest cursor-pointer hover:underline transition-all"
              title="Click to toggle between live published menu and real-time database draft preview"
            >
              Switch to {previewMode === "draft" ? "Live" : "Draft"}
            </button>
          </div>
        </motion.div>
      )}

      {/* CORE RESERVATION CONFIGURATOR DIALOG */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        initialType={reservationType}
      />

      {/* DYNAMIC SIGN-IN & GATE CONTROL MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(fbUser, role) => {
          setCurrentUser(fbUser);
          setUserRole(role);
          if (role === "Super Admin" || role === "Admin") {
            setCurrentTab("admin");
          }
        }}
      />
    </div>
  );
}
