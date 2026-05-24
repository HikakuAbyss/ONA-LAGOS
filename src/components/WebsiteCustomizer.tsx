import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Type,
  LayoutTemplate,
  Sliders,
  Sparkles,
  Link2,
  Share2,
  Search,
  Image,
  Video,
  Plus,
  Trash2,
  Undo2,
  Save,
  Globe,
  MapPin,
  CalendarDays,
  FileCheck2,
  ArrowRight,
  Eye,
  Check,
  ChevronUp,
  ChevronDown,
  Clock,
  Mail,
  Phone,
  Upload,
  Info,
  SlidersHorizontal,
  FolderLock,
  Play,
  RotateCcw
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// High-fidelity TypeScript interface for entire visual CMS
export interface CMSSettings {
  branding: {
    brandName: string;
    tagline: string;
    logoUrl: string;
    footerLogoUrl: string;
    mobileLogoUrl: string;
    loadingLogoUrl: string;
    favicon: string;
  };
  colors: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    panelColor: string;
    goldAccent: string;
    isDarkMode: boolean;
    buttonStyle: "square" | "rounded" | "pill";
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSize: "sm" | "base" | "lg" | "xl";
    bodySize: "sm" | "base" | "lg";
    letterSpacing: "normal" | "wide" | "widest";
    uppercaseHeadings: boolean;
  };
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    backgroundVideo: string;
    ctaText: string;
    ctaLink: string;
    toggleOverlay: boolean;
    overlayOpacity: number;
    contentOrder: string[];
  };
  homepageSections: Array<{
    id: string;
    name: string;
    visible: boolean;
    order: number;
    heading: string;
    description: string;
    bgImage: string;
  }>;
  menuAppearance: {
    layout: "grid" | "list" | "bento";
    cardStyle: "classic" | "minimal" | "bordered";
    categoryColors: Record<string, string>;
    categoryBanners: Record<string, string>;
  };
  gallery: {
    layout: "grid" | "masonry";
    hoverAnimations: boolean;
    featuredImageIds: string[];
    transitionEffect: "fade" | "slide" | "zoom";
  };
  footer: {
    text: string;
    copyright: string;
    socialLinks: Record<string, string>;
    layout: "centered" | "grid-4-cols";
    bgImage: string;
    newsletterEnabled: boolean;
  };
  navigation: {
    sticky: boolean;
    transparency: boolean;
    mobileStyle: "drawer" | "overlay";
    items: Array<{ label: string; tabId: string }>;
  };
  socials: {
    instagram: string;
    tiktok: string;
    whatsapp: string;
    twitter: string;
    facebook: string;
    youtube: string;
  };
  seo: {
    pageTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string;
    structuredData: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    openingHours: Array<{ day: string; hours: string }>;
    reservationLink: string;
    googleMaps: string;
  };
  animations: {
    enabled: boolean;
    speed: "slow" | "normal" | "fast";
    transitionStyle: "fade" | "slide-up";
    scrollEffects: boolean;
  };
  mediaLibrary: Array<{
    id: string;
    url: string;
    name: string;
    type: "image" | "video";
    date: string;
  }>;
  customPromoBanners: Array<{
    id: string;
    text: string;
    type: "events" | "brunch" | "private" | "seasonal";
    link: string;
    active: boolean;
  }>;
}

export const DEFAULT_CMS: CMSSettings = {
  branding: {
    brandName: "ONA LAGOS",
    tagline: "Where Heritage Meets High Modern Gastronomy",
    logoUrl: "", 
    footerLogoUrl: "",
    mobileLogoUrl: "",
    loadingLogoUrl: "",
    favicon: "",
  },
  colors: {
    primaryColor: "#4A3518",
    accentColor: "#A89C8F",
    backgroundColor: "#FAF6F0",
    panelColor: "#FCFAF5",
    goldAccent: "#C5A070",
    isDarkMode: false,
    buttonStyle: "square",
  },
  typography: {
    headingFont: "Cormorant Garamond",
    bodyFont: "Plus Jakarta Sans",
    headingSize: "base",
    bodySize: "base",
    letterSpacing: "wide",
    uppercaseHeadings: true,
  },
  hero: {
    title: "Experience Modern African Fine Dining",
    subtitle: "Ona Lagos is a modern African fine-dining destination designed to leave a lasting mark through food, culture, atmosphere, and hospitality.",
    backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80",
    backgroundVideo: "",
    ctaText: "Reserve a Table",
    ctaLink: "home",
    toggleOverlay: true,
    overlayOpacity: 40,
    contentOrder: ["title", "subtitle", "cta"]
  },
  homepageSections: [
    { id: "about", name: "About Narrative", visible: true, order: 1, heading: "La Maison Ona", description: "Ona means ‘a mark’ or ‘a sign’ in the Edo language. At Ona, every detail is designed to leave a lasting mark — through food, culture, atmosphere, and signature hospitality.", bgImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80" },
    { id: "dishes", name: "Featured Dishes", visible: true, order: 2, heading: "The Masterful Spheres", description: "We recreate classic culinary legacies — Efo Riro, Asun, Jollof — utilizing French techniques.", bgImage: "" },
    { id: "sunday", name: "Sunday Roast", visible: true, order: 3, heading: "Sunday Harvest & Roast", description: "Traditional joint carvings, slow-braised short ribs, and local music curations.", bgImage: "" },
    { id: "kids", name: "Kids Dining", visible: true, order: 4, heading: "Junior Culinary Journeys", description: "Crafted specifically for raw taste sensibilities with genuine premium nourishment.", bgImage: "" },
    { id: "cocktails", name: "Cocktails Ambiance", visible: true, order: 5, heading: "Ancestral Mixology", description: "We fuse single-estate local spirits with botanicals and palm infusions.", bgImage: "" },
    { id: "gallery", name: "Visual Gallery", visible: true, order: 6, heading: "The Sanctuary Framed", description: "A glimpse into our visual space and sensory platings.", bgImage: "" },
    { id: "testimonials", name: "Guest Words", visible: true, order: 7, heading: "Diplomatic Endorsements", description: "Unedited guest reviews from local and global gastronomes.", bgImage: "" },
    { id: "lifestyle", name: "Ona Lifestyle", visible: true, order: 8, heading: "Ona Lifestyle Collection", description: "Bespoke fine-dining pieces and premium merchandise inspired by the Ona Lagos aesthetic.", bgImage: "" },
    { id: "events", name: "Private Events CTA", visible: true, order: 9, heading: "Private Curations & Movie Shoots", description: "For celebrations or premium backdrops, Ona Lagos offers curated solutions.", bgImage: "" },
  ],
  menuAppearance: {
    layout: "grid",
    cardStyle: "classic",
    categoryColors: { starters: "#C5A070", signatures: "#8E704C", default: "#A89C8F" },
    categoryBanners: { starters: "", signatures: "" }
  },
  gallery: {
    layout: "grid",
    hoverAnimations: true,
    featuredImageIds: ["g1", "g2", "g3"],
    transitionEffect: "fade"
  },
  footer: {
    text: "Set in a sanctuary of hand-forged mud walls, golden arches, and soft woven organic fabrics, we celebrate the true luxury of sub-Saharan hospitality.",
    copyright: "© 226 Ona Lagos. Victoria Island. All Sovereign Rights Reserved.",
    socialLinks: { instagram: "https://instagram.com/onalagos", facebook: "https://facebook.com/onalagos", tiktok: "https://tiktok.com/@onalagos" },
    layout: "grid-4-cols",
    bgImage: "",
    newsletterEnabled: true
  },
  navigation: {
    sticky: true,
    transparency: true,
    mobileStyle: "drawer",
    items: [
      { label: "La Maison", tabId: "home" },
      { label: "Our Story", tabId: "about" },
      { label: "The Menu", tabId: "menu" },
      { label: "Family & Dietary", tabId: "kids-dietary" },
      { label: "Private Events", tabId: "events" },
      { label: "Gallery", tabId: "gallery" },
      { label: "Contact & Hours", tabId: "contact" }
    ]
  },
  socials: {
    instagram: "https://instagram.com/onalagos",
    tiktok: "https://tiktok.com/@onalagos",
    whatsapp: "https://wa.me/234900000000",
    twitter: "https://twitter.com/onalagos",
    facebook: "https://facebook.com/onalagos",
    youtube: "https://youtube.com/onalagos"
  },
  seo: {
    pageTitle: "Ona Lagos | Modern African Fine Dining",
    metaDescription: "Experience Victoria Island's most distinctive fine dining sanctuary. Modern West African gastronomy reimagined with heritage techniques.",
    ogImage: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800",
    keywords: "Lagos restaurant, Victoria island fine dining, West African food, Nigerian Jollof, gourmet restaurant Lagos",
    structuredData: "{}"
  },
  contact: {
    address: "Plot 14, Victoria Island Lounge District, Victoria Island, Lagos, Nigeria",
    phone: "+234 (0) 90 ONA LAGOS",
    email: "reservations@onalagos.com",
    openingHours: [
      { day: "Tuesdays & Thursdays", hours: "12:30 PM - 3:30 PM / 6:00 PM - 11:00 PM" },
      { day: "Wednesdays", hours: "Closed (No Operations)" },
      { day: "Fridays", hours: "12:30 PM - 4:00 PM / 6:00 PM - Midnight" },
      { day: "Saturdays", hours: "11:00 AM - 4:00 PM / 6:00 PM - Midnight" },
      { day: "Sundays (Sunday Roast Only)", hours: "11:00 AM - 4:30 PM / 6:00 PM - 10:30 PM" }
    ],
    reservationLink: "https://reservations.onalagos.com",
    googleMaps: "https://maps.google.com"
  },
  animations: {
    enabled: true,
    speed: "normal",
    transitionStyle: "fade",
    scrollEffects: true
  },
  mediaLibrary: [
    { id: "m1", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80", name: "Ona Main Dining Saloon", type: "image", date: "2026-05-23" },
    { id: "m2", url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop&q=80", name: "Slow-Braised Short Rib Jollof", type: "image", date: "2026-05-23" },
    { id: "m3", url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80", name: "The Ona Elixir Rum infusion", type: "image", date: "2026-05-23" },
    { id: "m4", url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80", name: "Scent Leaf Outdoor Garden", type: "image", date: "2026-05-23" },
    { id: "m5", url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80", name: "Artisanal Open Bar Platings", type: "image", date: "2026-05-23" }
  ],
  customPromoBanners: [
    { id: "p1", text: "SUNDAY BRUNCH CURATION: Free-flowing premium Palm Wine Mimosa cocktails and roast lamb carvings.", type: "brunch", link: "reserve", active: true },
    { id: "p2", text: "CELEBRATIONS OF LEGACY: Private family events, diplomatic receptions, and movie/art productions custom-styled.", type: "events", link: "contact", active: true }
  ]
};

interface WebsiteCustomizerProps {
  currentUser: {
    uid: string;
    email: string;
    role: string;
  };
}

export default function WebsiteCustomizer({ currentUser }: WebsiteCustomizerProps) {
  const [activeTab, setActiveTab] = useState<string>("branding");
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<CMSSettings>(DEFAULT_CMS);
  const [originalSettings, setOriginalSettings] = useState<CMSSettings>(DEFAULT_CMS);
  const [showPublishSuccess, setShowPublishSuccess] = useState<boolean>(false);
  const [showSaveDraftSuccess, setShowSaveDraftSuccess] = useState<boolean>(false);
  
  // Media library upload helpers
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [uploadName, setUploadName] = useState<string>("");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [activeSelectField, setActiveSelectField] = useState<{ section: string; field: string; subIdx?: number } | null>(null);

  // New banner helpers
  const [bannerText, setBannerText] = useState<string>("");
  const [bannerType, setBannerType] = useState<"events" | "brunch" | "private" | "seasonal">("events");
  const [bannerLink, setBannerLink] = useState<string>("home");

  // Logo upload and rollback support helper states
  const [logoBackup, setLogoBackup] = useState<Record<string, string> | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    // Dynamically snapshot original logos on settings load for immediate rollback backup reference
    if (settings && logoBackup === null && (settings.branding?.logoUrl || settings.branding?.mobileLogoUrl)) {
      setLogoBackup({
        logoUrl: settings.branding.logoUrl || "",
        mobileLogoUrl: settings.branding.mobileLogoUrl || "",
        footerLogoUrl: settings.branding.footerLogoUrl || "",
        loadingLogoUrl: settings.branding.loadingLogoUrl || "",
        favicon: settings.branding.favicon || ""
      });
    }
  }, [settings, logoBackup]);

  const handleLogoUpload = (field: string, file: File) => {
    // Strict web assets type validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(prev => ({ ...prev, [field]: "Unsupported type. Use PNG, JPG, JPEG, SVG or WEBP." }));
      return;
    }
    // Web limits verification (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(prev => ({ ...prev, [field]: "File exceeds 5MB memory limit." }));
      return;
    }

    setUploadError(prev => ({ ...prev, [field]: "" }));
    setSuccessMsg(prev => ({ ...prev, [field]: "" }));
    setUploadProgress(prev => ({ ...prev, [field]: 15 }));

    // Store current state as backup if none exists
    if (!logoBackup) {
      setLogoBackup({
        logoUrl: settings.branding.logoUrl || "",
        mobileLogoUrl: settings.branding.mobileLogoUrl || "",
        footerLogoUrl: settings.branding.footerLogoUrl || "",
        loadingLogoUrl: settings.branding.loadingLogoUrl || "",
        favicon: settings.branding.favicon || ""
      });
    }

    // High fidelity simulated upload progress behavior
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[field] || 15;
        if (current >= 95) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [field]: current + 25 };
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [field]: 100 }));
        updateField("branding", field, result);
        setSuccessMsg(prev => ({ ...prev, [field]: "Logo asset loaded! Press 'Save' & 'Publish' below to make live." }));
        
        setTimeout(() => {
          setUploadProgress(prev => {
            const nextProgress = { ...prev };
            delete nextProgress[field];
            return nextProgress;
          });
        }, 1200);
      }, 500);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadError(prev => ({ ...prev, [field]: "Failed to read localized binary." }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRollback = (field: string) => {
    if (logoBackup && logoBackup[field] !== undefined) {
      updateField("branding", field, logoBackup[field]);
      setSuccessMsg(prev => ({ ...prev, [field]: "Reverted to previous revision preview." }));
      setTimeout(() => {
        setSuccessMsg(prev => ({ ...prev, [field]: "" }));
      }, 2500);
    } else {
      setUploadError(prev => ({ ...prev, [field]: "No previous logo snapshot detected for rollback." }));
      setTimeout(() => {
        setUploadError(prev => ({ ...prev, [field]: "" }));
      }, 2500);
    }
  };

  // Load from DB
  useEffect(() => {
    const docRef = doc(db, "admin_settings", "cms_draft");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CMSSettings;
        // Merge with DEFAULT_CMS to maintain safety
        const merged: CMSSettings = {
          ...DEFAULT_CMS,
          ...data,
          branding: { ...DEFAULT_CMS.branding, ...(data.branding || {}) },
          colors: { ...DEFAULT_CMS.colors, ...(data.colors || {}) },
          typography: { ...DEFAULT_CMS.typography, ...(data.typography || {}) },
          hero: { ...DEFAULT_CMS.hero, ...(data.hero || {}) },
          homepageSections: data.homepageSections || DEFAULT_CMS.homepageSections,
          menuAppearance: { ...DEFAULT_CMS.menuAppearance, ...(data.menuAppearance || {}) },
          gallery: { ...DEFAULT_CMS.gallery, ...(data.gallery || {}) },
          footer: { ...DEFAULT_CMS.footer, ...(data.footer || {}) },
          navigation: { ...DEFAULT_CMS.navigation, ...(data.navigation || {}) },
          socials: { ...DEFAULT_CMS.socials, ...(data.socials || {}) },
          seo: { ...DEFAULT_CMS.seo, ...(data.seo || {}) },
          contact: { ...DEFAULT_CMS.contact, ...(data.contact || {}) },
          animations: { ...DEFAULT_CMS.animations, ...(data.animations || {}) },
          mediaLibrary: data.mediaLibrary || DEFAULT_CMS.mediaLibrary,
          customPromoBanners: data.customPromoBanners || DEFAULT_CMS.customPromoBanners,
        };
        setSettings(merged);
        setOriginalSettings(merged);
      } else {
        // If snapshot doesn't exist, try getting published
        getPublishedFallback();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error subscribing to cms_draft, fallback:", error);
      getPublishedFallback();
    });

    return () => unsubscribe();
  }, []);

  const getPublishedFallback = async () => {
    try {
      const pubDoc = await getDoc(doc(db, "admin_settings", "cms_config"));
      if (pubDoc.exists()) {
        const d = pubDoc.data() as CMSSettings;
        setSettings(d);
        setOriginalSettings(d);
      } else {
        // Create initial draft
        await setDoc(doc(db, "admin_settings", "cms_draft"), DEFAULT_CMS);
        setSettings(DEFAULT_CMS);
        setOriginalSettings(DEFAULT_CMS);
      }
    } catch (e) {
      console.error("Could not fetch published settings", e);
    }
    setLoading(false);
  };

  // Check roles
  const canModify = currentUser.role === "Super Admin" || currentUser.role === "Admin";

  const updateField = (section: keyof CMSSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleSaveDraft = async () => {
    if (!canModify) return;
    try {
      await setDoc(doc(db, "admin_settings", "cms_draft"), settings);
      // Synchronize locally in real-time
      localStorage.setItem("ona_mock_cms_draft", JSON.stringify(settings));
      setShowSaveDraftSuccess(true);
      setTimeout(() => setShowSaveDraftSuccess(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "admin_settings/cms_draft");
    }
  };

  const handlePublish = async () => {
    if (!canModify) return;
    try {
      // Save globally to active live config
      await setDoc(doc(db, "admin_settings", "cms_config"), settings);
      // Also save to draft pool to keep synced
      await setDoc(doc(db, "admin_settings", "cms_draft"), settings);
      setOriginalSettings(settings);
      
      // Update local storage and dispatch update event for immediate live web rendering
      localStorage.setItem("ona_mock_cms_config", JSON.stringify(settings));
      window.dispatchEvent(new Event("ona_cms_updated"));

      setShowPublishSuccess(true);
      setTimeout(() => setShowPublishSuccess(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "admin_settings/cms_config");
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to revert all local changes back to the original default layout? (Requires publishing to make it live)")) {
      setSettings(DEFAULT_CMS);
    }
  };

  const handleUndo = () => {
    setSettings(originalSettings);
  };

  // Section visibility and sorting helper
  const handleToggleSection = (id: string) => {
    setSettings(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(s => {
        if (s.id === id) return { ...s, visible: !s.visible };
        return s;
      })
    }));
  };

  const handleOrderSection = (idx: number, direction: "up" | "down") => {
    const sections = [...settings.homepageSections];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[idx];
    sections[idx] = sections[targetIdx];
    sections[targetIdx] = temp;

    // Re-index orders
    const updated = sections.map((sc, i) => ({ ...sc, order: i + 1 }));
    setSettings(prev => ({ ...prev, homepageSections: updated }));
  };

  const handleSectionTextChange = (id: string, field: "heading" | "description", val: string) => {
    setSettings(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(s => {
        if (s.id === id) return { ...s, [field]: val };
        return s;
      })
    }));
  };

  // Media library uploads
  const handleAddMedia = () => {
    if (!uploadUrl) return alert("Please enter an image or video URL");
    const newAsset = {
      id: "raw_" + Date.now(),
      url: uploadUrl,
      name: uploadName || "Custom Asset " + (settings.mediaLibrary.length + 1),
      type: uploadType,
      date: new Date().toISOString().split("T")[0]
    };

    setSettings(prev => ({
      ...prev,
      mediaLibrary: [newAsset, ...prev.mediaLibrary]
    }));
    setUploadUrl("");
    setUploadName("");
  };

  const handleDeleteMedia = (id: string) => {
    setSettings(prev => ({
      ...prev,
      mediaLibrary: prev.mediaLibrary.filter(item => item.id !== id)
    }));
  };

  const handleSelectFieldForMedia = (section: string, field: string, subIdx?: number) => {
    setActiveSelectField({ section, field, subIdx });
  };

  const handleApplyMedia = (url: string) => {
    if (!activeSelectField) return;
    const { section, field, subIdx } = activeSelectField;

    if (section === "homepageSections" && subIdx !== undefined) {
      setSettings(prev => ({
        ...prev,
        homepageSections: prev.homepageSections.map((s, idx) => {
          if (idx === subIdx) return { ...s, bgImage: url };
          return s;
        })
      }));
    } else {
      updateField(section as keyof CMSSettings, field, url);
    }
    setActiveSelectField(null);
  };

  // Banners actions
  const handleAddNewBanner = () => {
    if (!bannerText) return;
    const newBanner = {
      id: "p_" + Date.now(),
      text: bannerText,
      type: bannerType,
      link: bannerLink,
      active: true
    };
    setSettings(prev => ({
      ...prev,
      customPromoBanners: [...prev.customPromoBanners, newBanner]
    }));
    setBannerText("");
  };

  const handleToggleBannerState = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customPromoBanners: prev.customPromoBanners.map(b => sToActive(b, id))
    }));

    function sToActive(b: any, targetId: string) {
      if (b.id === targetId) return { ...b, active: !b.active };
      return b;
    }
  };

  const handleDeleteBanner = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customPromoBanners: prev.customPromoBanners.filter(b => b.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#FAF6F0] space-y-3">
        <Sparkles className="w-8 h-8 text-gold-400 animate-spin" />
        <span className="font-sans text-xs uppercase tracking-widest text-[#A89C8F]">Fetching Luxury CMS Configuration...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-[#4A3518]">
      
      {/* LEFT COLUMN: ACTIVE PANELS */}
      <div className="xl:col-span-7 bg-[#FCFAF5] border border-[#CBBDA9] p-6 space-y-6 luxury-glow rounded-sm">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#CBBDA9]/40 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-[#8E8274] text-[#FCFAF7] text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                CMS Board
              </span>
              <span className="font-sans text-xs text-[#8E8274] font-medium">Ona Lagos Customizer</span>
            </div>
            <h2 className="font-serif text-2xl font-light text-[#4A3518] mt-1">Website Customization Panel</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleUndo}
              className="px-3 py-2 border border-[#CBBDA9] text-xs font-sans uppercase tracking-wider hover:bg-[#FAF6F0] transition flex items-center gap-1.5 cursor-pointer rounded-xs"
              title="Undo custom preview changes and reload published configuration"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 border border-red-200 text-red-700 text-xs font-sans uppercase tracking-wider hover:bg-red-50 transition flex items-center gap-1.5 cursor-pointer rounded-xs"
              title="Reset configuration values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={!canModify}
              className="px-3 py-2 bg-[#DDD9D0] border border-[#8E8274]/30 text-[#4A3518] text-xs font-sans uppercase tracking-wider hover:bg-[#C2B9AC] transition flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={!canModify}
              className="px-4 py-2 bg-[#8E8274] text-white text-xs font-sans uppercase tracking-widest hover:bg-[#706558] transition flex items-center gap-2 cursor-pointer font-bold rounded-xs shadow-md"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish Live
            </button>
          </div>
        </div>

        {/* FEEDBACK POPUPS */}
        <AnimatePresence>
          {showPublishSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 font-sans"
            >
              <Check className="w-4 h-4 text-emerald-600 font-bold" />
              <span><strong>SUCCESSFULLY PUBLISHED!</strong> All cosmetic custom adjustments are now live on the public storefront.</span>
            </motion.div>
          )}
          {showSaveDraftSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm flex items-center gap-2 font-sans"
            >
              <Check className="w-4 h-4 text-amber-600" />
              <span><strong>DRAFT SAVED!</strong> Cosmetic settings saved as draft. Tap "Publish Live" to transmit directly to visitors.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CMS TAB NAVIGATION */}
        <div className="flex flex-wrap gap-1 border-b border-[#CBBDA9]/20 pb-2 overflow-x-auto">
          {[
            { id: "branding", label: "Branding", icon: Sliders },
            { id: "colors", label: "Theme Colors & Modes", icon: Palette },
            { id: "typography", label: "Typography", icon: Type },
            { id: "hero", label: "Hero Banner", icon: LayoutTemplate },
            { id: "sections", label: "Sections Order", icon: SlidersHorizontal },
            { id: "menu", label: "Menu Look", icon: Sliders },
            { id: "gallery", label: "Gallery", icon: Image },
            { id: "footer", label: "Footer", icon: SlidersHorizontal },
            { id: "navigation", label: "Navbar & Nav Links", icon: Link2 },
            { id: "socials", label: "Social Connectors", icon: Share2 },
            { id: "promos", label: "Promo Banners", icon: Sparkles },
            { id: "business", label: "Business Coordinates", icon: MapPin },
            { id: "seo", label: "SEO Config", icon: Globe },
            { id: "animations", label: "Motion Speed", icon: Sparkles },
            { id: "media", label: "Library Assets", icon: Image }
          ].map(tab => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSelectField(null);
                }}
                className={`py-2 px-3 text-[10px] uppercase tracking-wider font-sans font-medium flex items-center gap-1.5 transition border-b-2 cursor-pointer focus:outline-none ${
                  isSel
                    ? "border-[#4A3518] text-[#4A3518] font-bold"
                    : "border-transparent text-gray-500 hover:text-[#4A3518]"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS PANEL */}
        <div className="py-4 space-y-6">
          
          {/* 1. BRANDING & IDENTITY */}
          {activeTab === "branding" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs space-y-1">
                <span className="font-serif font-bold text-[#8C6D4F] text-xs">Aesthetic Branding Management</span>
                <p className="text-[11px] text-gray-500 font-light">Customise the public logos, favicons, and baseline brand representation text.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-semibold">Brand Name Text</label>
                  <input
                    type="text"
                    value={settings.branding.brandName}
                    onChange={e => updateField("branding", "brandName", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 focus:outline-none"
                    placeholder="e.g. ONA LAGOS"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-semibold">Slogan Tagline</label>
                  <input
                    type="text"
                    value={settings.branding.tagline}
                    onChange={e => updateField("branding", "tagline", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 focus:outline-none"
                    placeholder="e.g. Where Heritage Meets Innovation"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FCFAF5] p-4 border border-[#CBBDA9]/20 rounded-xs">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D4F] block">Image Core & Vector Logos</span>
                    <p className="text-[10px] text-gray-500 font-light mt-0.5">Upload image files directly to update website branding instantly. Recommended formats: PNG, WEBP or vector SVG with transparent background.</p>
                  </div>
                  <div className="flex gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={handleResetToDefault}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[9px] uppercase tracking-wider font-semibold cursor-pointer whitespace-nowrap transition"
                    >
                      Reset All Logos
                    </button>
                    {logoBackup && (
                      <button
                        onClick={() => {
                          if (window.confirm("Rollback all active logo slots back to the previous snapshot version?")) {
                            setSettings(prev => ({
                              ...prev,
                              branding: {
                                ...prev.branding,
                                logoUrl: logoBackup.logoUrl,
                                mobileLogoUrl: logoBackup.mobileLogoUrl,
                                footerLogoUrl: logoBackup.footerLogoUrl,
                                loadingLogoUrl: logoBackup.loadingLogoUrl,
                                favicon: logoBackup.favicon
                              }
                            }));
                          }
                        }}
                        className="px-3 py-1.5 border border-[#8C6D4F]/40 text-[#8C6D4F] hover:bg-[#8C6D4F]/5 text-[9px] uppercase tracking-wider font-semibold cursor-pointer whitespace-nowrap transition"
                      >
                        Rollback All
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Card 1: Vector Primary Logo */}
                  <div className="border border-[#CBBDA9]/30 bg-white p-4 space-y-4 rounded-xs transition hover:shadow-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A3518] font-bold block">1. Main Website Logo</label>
                        <span className="text-[9px] text-[#A89C8F]">Desktop Top Navbar Header</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light leading-snug">Main brand signature displayed in the desktop sticky navigation bar.</p>
                    </div>

                    {/* Logo Preview Panel */}
                    <div className="h-28 bg-[#1e1a15] rounded-xs border border-dashed border-[#CBBDA9]/20 flex items-center justify-center p-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                      {settings.branding.logoUrl ? (
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <img
                            src={settings.branding.logoUrl}
                            alt="Main website logo preview"
                            referrerPolicy="no-referrer"
                            className="max-h-16 max-w-[200px] object-contain"
                          />
                          <button
                            onClick={() => updateField("branding", "logoUrl", "")}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-[9px] uppercase tracking-widest cursor-pointer shadow-sm transition"
                            title="Clear this preview image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 space-y-1.5">
                          <span className="font-serif text-lg tracking-[0.1em] text-gray-400">Typography Fallback Active</span>
                          <p className="text-[9px] text-gray-400 italic">No image. Main site headers will spell "{settings.branding.brandName || "ONA LAGOS"}"</p>
                        </div>
                      )}
                    </div>

                    {/* Drag-and-drop Area */}
                    <div className="space-y-2">
                      <div className="border border-dashed border-[#CBBDA9]/40 hover:border-[#8C6D4F] bg-[#FCFAF5]/50 hover:bg-[#FCFAF5] p-3 text-center cursor-pointer transition rounded-xs relative">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={e => {
                            if (e.target.files?.[0]) handleLogoUpload("logoUrl", e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-4 h-4 text-[#8C6D4F]" />
                          <span className="text-[10px] font-semibold text-[#8C6D4F]">Click to upload or Drag File here</span>
                          <span className="text-[8px] text-gray-400">PNG, JPG, SVG, WEBP (Max 5MB)</span>
                        </div>
                      </div>

                      {/* Manual / Library Selection fallback */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.branding.logoUrl}
                          onChange={e => updateField("branding", "logoUrl", e.target.value)}
                          className="flex-grow bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                          placeholder="Paste Direct HTTPS Logo URL option..."
                        />
                        <button
                          onClick={() => handleSelectFieldForMedia("branding", "logoUrl")}
                          className="px-2.5 bg-[#8C6D4F] text-white hover:bg-[#725438] text-[9px] font-medium uppercase tracking-wider transition cursor-pointer"
                        >
                          Library
                        </button>
                      </div>

                      {/* Feedback Indicators */}
                      {uploadProgress.logoUrl !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-[#8C6D4F]">
                            <span>Uploading Asset...</span>
                            <span>{uploadProgress.logoUrl}%</span>
                          </div>
                          <div className="w-full bg-[#FAF6F0] h-1 overflow-hidden rounded-full">
                            <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${uploadProgress.logoUrl}%` }} />
                          </div>
                        </div>
                      )}
                      {uploadError.logoUrl && <p className="text-[9px] text-red-500 font-medium">{uploadError.logoUrl}</p>}
                      {successMsg.logoUrl && <p className="text-[9px] text-emerald-600 font-medium">{successMsg.logoUrl}</p>}
                      {logoBackup && logoBackup.logoUrl !== settings.branding.logoUrl && (
                        <button
                          onClick={() => handleLogoRollback("logoUrl")}
                          className="text-[9px] uppercase tracking-wider text-[#8C6D4F] hover:underline block font-semibold"
                        >
                          &larr; Restore Previous Main Logo ({logoBackup.logoUrl ? "Image" : "Text"})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Mobile Logo */}
                  <div className="border border-[#CBBDA9]/30 bg-white p-4 space-y-4 rounded-xs transition hover:shadow-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A3518] font-bold block">2. Mobile Logo</label>
                        <span className="text-[9px] text-[#A89C8F]">Mobile Drawer/Navbar</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light leading-snug">Brand identifier used on dynamic mobile screens and layouts.</p>
                    </div>

                    {/* Logo Preview Panel */}
                    <div className="h-28 bg-[#1e1a15] rounded-xs border border-dashed border-[#CBBDA9]/20 flex items-center justify-center p-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                      {settings.branding.mobileLogoUrl ? (
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <img
                            src={settings.branding.mobileLogoUrl}
                            alt="Mobile logo preview"
                            referrerPolicy="no-referrer"
                            className="max-h-14 max-w-[160px] object-contain"
                          />
                          <button
                            onClick={() => updateField("branding", "mobileLogoUrl", "")}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-[9px] cursor-pointer shadow-sm transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 space-y-1">
                          <span className="font-serif text-base tracking-[0.1em] text-gray-400">Main Logo Fallback</span>
                          <p className="text-[9px] text-gray-400 italic">No mobile override set. Main logo layout remains default template.</p>
                        </div>
                      )}
                    </div>

                    {/* Drag-and-drop Area */}
                    <div className="space-y-2">
                      <div className="border border-dashed border-[#CBBDA9]/40 hover:border-[#8C6D4F] bg-[#FCFAF5]/50 hover:bg-[#FCFAF5] p-3 text-center cursor-pointer transition rounded-xs relative">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={e => {
                            if (e.target.files?.[0]) handleLogoUpload("mobileLogoUrl", e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-4 h-4 text-[#8C6D4F]" />
                          <span className="text-[10px] font-semibold text-[#8C6D4F]">Click to upload or Drag File here</span>
                          <span className="text-[8px] text-gray-400">PNG, JPG, SVG, WEBP (Max 5MB)</span>
                        </div>
                      </div>

                      {/* Manual input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.branding.mobileLogoUrl}
                          onChange={e => updateField("branding", "mobileLogoUrl", e.target.value)}
                          className="flex-grow bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                          placeholder="Paste Mobile Logo URL option..."
                        />
                        <button
                          onClick={() => handleSelectFieldForMedia("branding", "mobileLogoUrl")}
                          className="px-2.5 bg-[#8C6D4F] text-white hover:bg-[#725438] text-[9px] font-medium uppercase tracking-wider transition cursor-pointer"
                        >
                          Library
                        </button>
                      </div>

                      {/* Feedback Indicators */}
                      {uploadProgress.mobileLogoUrl !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-[#8C6D4F]">
                            <span>Uploading Mobile Override...</span>
                            <span>{uploadProgress.mobileLogoUrl}%</span>
                          </div>
                          <div className="w-full bg-[#FAF6F0] h-1 overflow-hidden rounded-full">
                            <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${uploadProgress.mobileLogoUrl}%` }} />
                          </div>
                        </div>
                      )}
                      {uploadError.mobileLogoUrl && <p className="text-[9px] text-red-500 font-medium">{uploadError.mobileLogoUrl}</p>}
                      {successMsg.mobileLogoUrl && <p className="text-[9px] text-emerald-600 font-medium">{successMsg.mobileLogoUrl}</p>}
                      {logoBackup && logoBackup.mobileLogoUrl !== settings.branding.mobileLogoUrl && (
                        <button
                          onClick={() => handleLogoRollback("mobileLogoUrl")}
                          className="text-[9px] uppercase tracking-wider text-[#8C6D4F] hover:underline block font-semibold"
                        >
                          &larr; Restore Previous Mobile Logo Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Footer Logo */}
                  <div className="border border-[#CBBDA9]/30 bg-white p-4 space-y-4 rounded-xs transition hover:shadow-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A3518] font-bold block">3. Footer Logo</label>
                        <span className="text-[9px] text-[#A89C8F]">Page Bottom Footer</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light leading-snug">Brand identifier displayed at the bottom of standard home and child subpages.</p>
                    </div>

                    {/* Logo Preview Panel */}
                    <div className="h-28 bg-[#1e1a15] rounded-xs border border-dashed border-[#CBBDA9]/20 flex items-center justify-center p-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                      {settings.branding.footerLogoUrl ? (
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <img
                            src={settings.branding.footerLogoUrl}
                            alt="Footer logo preview"
                            referrerPolicy="no-referrer"
                            className="max-h-14 max-w-[160px] object-contain animate-fade-in"
                          />
                          <button
                            onClick={() => updateField("branding", "footerLogoUrl", "")}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-[9px] cursor-pointer shadow-sm transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 space-y-1">
                          <span className="font-serif text-base tracking-[0.1em] text-gray-400">Primary Logo Fallback</span>
                          <p className="text-[9px] text-gray-400 italic">No footer override set. Main logo layout remains default template.</p>
                        </div>
                      )}
                    </div>

                    {/* Drag-and-drop Area */}
                    <div className="space-y-2">
                      <div className="border border-dashed border-[#CBBDA9]/40 hover:border-[#8C6D4F] bg-[#FCFAF5]/50 hover:bg-[#FCFAF5] p-3 text-center cursor-pointer transition rounded-xs relative">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={e => {
                            if (e.target.files?.[0]) handleLogoUpload("footerLogoUrl", e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-4 h-4 text-[#8C6D4F]" />
                          <span className="text-[10px] font-semibold text-[#8C6D4F]">Click to upload or Drag File here</span>
                          <span className="text-[8px] text-gray-400">PNG, JPG, SVG, WEBP (Max 5MB)</span>
                        </div>
                      </div>

                      {/* Manual input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.branding.footerLogoUrl}
                          onChange={e => updateField("branding", "footerLogoUrl", e.target.value)}
                          className="flex-grow bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                          placeholder="Paste Footer Override Logo URL option..."
                        />
                        <button
                          onClick={() => handleSelectFieldForMedia("branding", "footerLogoUrl")}
                          className="px-2.5 bg-[#8C6D4F] text-white hover:bg-[#725438] text-[9px] font-medium uppercase tracking-wider transition cursor-pointer"
                        >
                          Library
                        </button>
                      </div>

                      {/* Feedback Indicators */}
                      {uploadProgress.footerLogoUrl !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-[#8C6D4F]">
                            <span>Uploading Footer Override...</span>
                            <span>{uploadProgress.footerLogoUrl}%</span>
                          </div>
                          <div className="w-full bg-[#FAF6F0] h-1 overflow-hidden rounded-full">
                            <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${uploadProgress.footerLogoUrl}%` }} />
                          </div>
                        </div>
                      )}
                      {uploadError.footerLogoUrl && <p className="text-[9px] text-red-500 font-medium">{uploadError.footerLogoUrl}</p>}
                      {successMsg.footerLogoUrl && <p className="text-[9px] text-emerald-600 font-medium">{successMsg.footerLogoUrl}</p>}
                      {logoBackup && logoBackup.footerLogoUrl !== settings.branding.footerLogoUrl && (
                        <button
                          onClick={() => handleLogoRollback("footerLogoUrl")}
                          className="text-[9px] uppercase tracking-wider text-[#8C6D4F] hover:underline block font-semibold"
                        >
                          &larr; Restore Previous Footer Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Loading Screen Splash Logo */}
                  <div className="border border-[#CBBDA9]/30 bg-white p-4 space-y-4 rounded-xs transition hover:shadow-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A3518] font-bold block">4. Loading Splash Logo</label>
                        <span className="text-[9px] text-[#A89C8F]">Preloader / Intro Display</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light leading-snug">Featured center graphic displayed in the high-contrast loading screen on load.</p>
                    </div>

                    {/* Logo Preview Panel */}
                    <div className="h-28 bg-[#1e1a15] rounded-xs border border-dashed border-[#CBBDA9]/20 flex items-center justify-center p-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                      {settings.branding.loadingLogoUrl ? (
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <img
                            src={settings.branding.loadingLogoUrl}
                            alt="Splash preloader preview"
                            referrerPolicy="no-referrer"
                            className="max-h-16 max-w-[200px] object-contain animate-pulse"
                          />
                          <button
                            onClick={() => updateField("branding", "loadingLogoUrl", "")}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-[9px] cursor-pointer shadow-sm transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 space-y-1">
                          <span className="font-serif text-base tracking-[0.1em] text-gray-400">Primary Logo Fallback</span>
                          <p className="text-[9px] text-gray-400 italic">No override. The initial preloader uses main logo or typography settings.</p>
                        </div>
                      )}
                    </div>

                    {/* Drag-and-drop Area */}
                    <div className="space-y-2">
                      <div className="border border-dashed border-[#CBBDA9]/40 hover:border-[#8C6D4F] bg-[#FCFAF5]/50 hover:bg-[#FCFAF5] p-3 text-center cursor-pointer transition rounded-xs relative">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={e => {
                            if (e.target.files?.[0]) handleLogoUpload("loadingLogoUrl", e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-4 h-4 text-[#8C6D4F]" />
                          <span className="text-[10px] font-semibold text-[#8C6D4F]">Click to upload or Drag File here</span>
                          <span className="text-[8px] text-gray-400">PNG, JPG, SVG, WEBP (Max 5MB)</span>
                        </div>
                      </div>

                      {/* Manual input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.branding.loadingLogoUrl}
                          onChange={e => updateField("branding", "loadingLogoUrl", e.target.value)}
                          className="flex-grow bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                          placeholder="Paste Entrance Preloader URL option..."
                        />
                        <button
                          onClick={() => handleSelectFieldForMedia("branding", "loadingLogoUrl")}
                          className="px-2.5 bg-[#8C6D4F] text-white hover:bg-[#725438] text-[9px] font-medium uppercase tracking-wider transition cursor-pointer"
                        >
                          Library
                        </button>
                      </div>

                      {/* Feedback Indicators */}
                      {uploadProgress.loadingLogoUrl !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-[#8C6D4F]">
                            <span>Uploading Entrance Splash...</span>
                            <span>{uploadProgress.loadingLogoUrl}%</span>
                          </div>
                          <div className="w-full bg-[#FAF6F0] h-1 overflow-hidden rounded-full">
                            <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${uploadProgress.loadingLogoUrl}%` }} />
                          </div>
                        </div>
                      )}
                      {uploadError.loadingLogoUrl && <p className="text-[9px] text-red-500 font-medium">{uploadError.loadingLogoUrl}</p>}
                      {successMsg.loadingLogoUrl && <p className="text-[9px] text-emerald-600 font-medium">{successMsg.loadingLogoUrl}</p>}
                      {logoBackup && logoBackup.loadingLogoUrl !== settings.branding.loadingLogoUrl && (
                        <button
                          onClick={() => handleLogoRollback("loadingLogoUrl")}
                          className="text-[9px] uppercase tracking-wider text-[#8C6D4F] hover:underline block font-semibold"
                        >
                          &larr; Restore Previous Loading Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 5: Favicon */}
                  <div className="border border-[#CBBDA9]/30 bg-white p-4 space-y-4 rounded-xs transition hover:shadow-xs flex flex-col justify-between xl:col-span-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[10px] uppercase tracking-widest text-[#4A3518] font-bold block">5. Favicon Shortcut Icon</label>
                        <span className="text-[9px] text-[#A89C8F]">Browser tab icon & SEO</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light leading-snug">Favicon file displayed next to the page heading inside browser tabs and bookmarks bar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Logo Preview Panel */}
                      <div className="h-28 bg-[#1e1a15] rounded-xs border border-dashed border-[#CBBDA9]/20 flex items-center justify-center p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                        {settings.branding.favicon ? (
                          <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="p-3 bg-[#FCFAF7] rounded-md shadow-inner border border-gold-400/20 flex items-center justify-center">
                              <img
                                src={settings.branding.favicon}
                                alt="Favicon shortcut icon preview"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                            <span className="text-[9px] font-mono text-gray-400 truncate max-w-[150px]">{settings.branding.favicon.substring(0, 35)}...</span>
                            <button
                              onClick={() => updateField("branding", "favicon", "")}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-[9px] cursor-pointer shadow-sm transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 gap-1 flex flex-col items-center">
                            <div className="w-6 h-6 border border-dashed border-gray-600 flex items-center justify-center text-[10px] rounded-xs">F</div>
                            <span className="font-sans text-[10px] text-gray-400">Default Template Favicon Active</span>
                          </div>
                        )}
                      </div>

                      {/* Drop and uploads */}
                      <div className="space-y-2">
                        <div className="border border-dashed border-[#CBBDA9]/40 hover:border-[#8C6D4F] bg-[#FCFAF5]/50 hover:bg-[#FCFAF5] p-2.5 text-center cursor-pointer transition rounded-xs relative">
                          <input
                            type="file"
                            accept=".png,.ico,.jpg,.jpeg,.svg,.webp"
                            onChange={e => {
                              if (e.target.files?.[0]) handleLogoUpload("favicon", e.target.files[0]);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex flex-col items-center space-y-0.5">
                            <Upload className="w-3.5 h-3.5 text-[#8C6D4F]" />
                            <span className="text-[10px] font-semibold text-[#8C6D4F]">Click to upload Favicon</span>
                            <span className="text-[8px] text-gray-400">ICO, PNG, SVG (Max 5MB)</span>
                          </div>
                        </div>

                        {/* Direct input fallback */}
                        <input
                          type="text"
                          value={settings.branding.favicon}
                          onChange={e => updateField("branding", "favicon", e.target.value)}
                          className="w-full bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                          placeholder="Paste custom Favicon Shortcut HTTPS link directly... (or upload file)"
                        />

                        {/* Feedback Indicators */}
                        {uploadProgress.favicon !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-[#8C6D4F]">
                              <span>Uploading Favicon...</span>
                              <span>{uploadProgress.favicon}%</span>
                            </div>
                            <div className="w-full bg-[#FAF6F0] h-1 overflow-hidden rounded-full">
                              <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${uploadProgress.favicon}%` }} />
                            </div>
                          </div>
                        )}
                        {uploadError.favicon && <p className="text-[9px] text-red-500 font-medium">{uploadError.favicon}</p>}
                        {successMsg.favicon && <p className="text-[9px] text-emerald-600 font-medium">{successMsg.favicon}</p>}
                        {logoBackup && logoBackup.favicon !== settings.branding.favicon && (
                          <button
                            onClick={() => handleLogoRollback("favicon")}
                            className="text-[9px] uppercase tracking-wider text-[#8C6D4F] hover:underline block font-semibold"
                          >
                            &larr; Restore Previous Favicon Override Link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main save/publish status actions */}
                <div className="mt-8 flex flex-wrap justify-between items-center gap-4 bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-sans">You have unsaved changes regarding branding assets. ClickSave to save standard draft settings or Publish to apply vector logos to live pages.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!canModify}
                      className="px-5 py-2 hover:bg-[#725438]/5 border border-[#8C6D4F] text-[#8C6D4F] flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer disabled:opacity-40 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Draft
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={!canModify}
                      className="px-6 py-2 bg-[#8C6D4F] hover:bg-[#725438] text-white flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer disabled:opacity-40 shadow-sm transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Publish Live
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. COLOR & THEME SETTINGS */}
          {activeTab === "colors" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Luxury Color & Theme Engine</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Control the structural tone, luxury modes, button edges, and precise color keys.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <span className="text-[11px] font-bold text-gray-600 uppercase block tracking-wider">Canvas Base Tone</span>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={settings.colors.backgroundColor}
                      onChange={e => updateField("colors", "backgroundColor", e.target.value)}
                      className="w-10 h-10 border rounded-sm outline-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.colors.backgroundColor}
                      onChange={e => updateField("colors", "backgroundColor", e.target.value)}
                      className="w-24 p-1.5 border border-[#CBBDA9]/40 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <span className="text-[11px] font-bold text-gray-600 uppercase block tracking-wider">Primary Antique Color</span>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={settings.colors.primaryColor}
                      onChange={e => updateField("colors", "primaryColor", e.target.value)}
                      className="w-10 h-10 border rounded-sm outline-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.colors.primaryColor}
                      onChange={e => updateField("colors", "primaryColor", e.target.value)}
                      className="w-24 p-1.5 border border-[#CBBDA9]/40 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <span className="text-[11px] font-bold text-gray-600 uppercase block tracking-wider">Accent Sand/Gold Shade</span>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={settings.colors.goldAccent}
                      onChange={e => updateField("colors", "goldAccent", e.target.value)}
                      className="w-10 h-10 border rounded-sm outline-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.colors.goldAccent}
                      onChange={e => updateField("colors", "goldAccent", e.target.value)}
                      className="w-24 p-1.5 border border-[#CBBDA9]/40 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 border border-[#CBBDA9]/20 p-4 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Action Button Geometry</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["square", "rounded", "pill"].map(style => (
                      <button
                        key={style}
                        onClick={() => updateField("colors", "buttonStyle", style)}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.colors.buttonStyle === style
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 border border-[#CBBDA9]/20 p-4 bg-white rounded-xs flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Contrast Luxury Mode</span>
                      <p className="text-[10px] text-gray-500 font-light">Toggle between soft light champagne and rich velvet dark interfaces.</p>
                    </div>
                    <button
                      onClick={() => updateField("colors", "isDarkMode", !settings.colors.isDarkMode)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.colors.isDarkMode ? "bg-amber-600" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.colors.isDarkMode ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. TYPOGRAPHY */}
          {activeTab === "typography" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Typography & Letter Spacings</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Control serif heading styles, spacing widths, and editorial capitalization rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Primary Heading Serif Family</label>
                  <select
                    value={settings.typography.headingFont}
                    onChange={e => updateField("typography", "headingFont", e.target.value)}
                    className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/40 outline-none"
                  >
                    <option value="Cormorant Garamond">Cormorant Garamond (Editorial Italics)</option>
                    <option value="Playfair Display">Playfair Display (Contemporary Contrast)</option>
                    <option value="Cinzel">Cinzel (Classic Roman Imperial)</option>
                    <option value="Inter">Inter (Swiss Modernist)</option>
                  </select>
                </div>

                <div className="space-y-2 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Standard Body Font Family</label>
                  <select
                    value={settings.typography.bodyFont}
                    onChange={e => updateField("typography", "bodyFont", e.target.value)}
                    className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/40 outline-none"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek Geometric)</option>
                    <option value="Inter">Inter (Highly Readable Neutral)</option>
                    <option value="Montserrat">Montserrat (Structural Sans)</option>
                  </select>
                </div>

                <div className="space-y-2 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Heading Font Scaler</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["sm", "base", "lg", "xl"].map(size => (
                      <button
                        key={size}
                        onClick={() => updateField("typography", "headingSize", size)}
                        className={`p-1.5 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.typography.headingSize === size
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 p-3.5 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Letter Spacing Tracking</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["normal", "wide", "widest"].map(track => (
                      <button
                        key={track}
                        onClick={() => updateField("typography", "letterSpacing", track)}
                        className={`p-1.5 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.typography.letterSpacing === track
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#CBBDA9]/20 pt-4 p-2 bg-white rounded-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Enforce UPPERCASE Titles</span>
                  <p className="text-[10px] text-gray-500 font-light">Sets all header components to luxury capital letters automatically.</p>
                </div>
                <button
                  onClick={() => updateField("typography", "uppercaseHeadings", !settings.typography.uppercaseHeadings)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.typography.uppercaseHeadings ? "bg-amber-600" : "bg-gray-300"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.typography.uppercaseHeadings ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>
          )}

          {/* 4. HERO SECTION */}
          {activeTab === "hero" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Homepage Hero Cinematic Settings</span>
                <p className="text-[11px] text-gray-500 font-light">Customise the hero typography title, backdrop vectors, background videos, and action targets.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Hero Master Title</label>
                  <textarea
                    rows={2}
                    value={settings.hero.title}
                    onChange={e => updateField("hero", "title", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 focus:outline-none font-serif text-sm leading-relaxed"
                    placeholder="Headline text..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Hero Description Subtitle</label>
                  <textarea
                    rows={3}
                    value={settings.hero.subtitle}
                    onChange={e => updateField("hero", "subtitle", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 focus:outline-none"
                    placeholder="Decription..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#CBBDA9]/20 p-4 rounded-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold">Hero Background Image</label>
                      <button
                        onClick={() => handleSelectFieldForMedia("hero", "backgroundImage")}
                        className="text-[9px] uppercase font-bold tracking-wider text-[#8C6D4F]"
                      >
                        Select from Library
                      </button>
                    </div>
                    <input
                      type="text"
                      value={settings.hero.backgroundImage}
                      onChange={e => updateField("hero", "backgroundImage", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40 font-mono text-[11px]"
                      placeholder="e.g. Unsplash URL..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Hero Video Loop (URL)</label>
                    <input
                      type="text"
                      value={settings.hero.backgroundVideo}
                      onChange={e => updateField("hero", "backgroundVideo", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40 font-mono text-[11px]"
                      placeholder="HTTPS MP4 Link to play in background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#CBBDA9]/15 p-4 bg-white rounded-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Call to Action (CTA) Button Text</label>
                    <input
                      type="text"
                      value={settings.hero.ctaText}
                      onChange={e => updateField("hero", "ctaText", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">CTA Button Tab Destination</label>
                    <select
                      value={settings.hero.ctaLink}
                      onChange={e => updateField("hero", "ctaLink", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40"
                    >
                      <option value="home">La Maison (Home)</option>
                      <option value="menu">The Menu</option>
                      <option value="about">Our Story</option>
                      <option value="contact">Contact & Valet</option>
                      <option value="reserve">Book Table Prompt</option>
                    </select>
                  </div>
                </div>

                <div className="border border-[#CBBDA9]/10 p-3.5 bg-white rounded-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Backdrop Dimming Overlay</span>
                    <p className="text-[10px] text-gray-500 font-light font-sans">Darkens the background for perfect text visibility.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateField("hero", "toggleOverlay", !settings.hero.toggleOverlay)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.hero.toggleOverlay ? "bg-amber-600" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.hero.toggleOverlay ? "translate-x-6" : ""}`} />
                    </button>
                    {settings.hero.toggleOverlay && (
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={settings.hero.overlayOpacity}
                        onChange={e => updateField("hero", "overlayOpacity", parseInt(e.target.value))}
                        className="w-20 cursor-pointer"
                        title="Overlay intensity"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. HOMEPAGE PORTFOLIO SECTIONS ORDER */}
          {activeTab === "sections" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Homepage Layout & Order Index</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Show or hide specific homepage modules, edit titles live, and reorder the flow using navigation buttons.</p>
              </div>

              <div className="space-y-3">
                {settings.homepageSections.map((sec, i) => (
                  <div
                    key={sec.id}
                    className={`flex items-start justify-between p-4 border rounded-sm transition ${
                      sec.visible ? "bg-white border-[#CBBDA9]" : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="space-y-2 flex-grow pr-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-1.5 bg-[#8E8274]/20 border border-[#8E8274]/30 text-gray-600 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          Index {i + 1}
                        </span>
                        <span className="font-sans font-bold text-[#4A3518] text-xs">{sec.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${sec.visible ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>

                      {sec.visible && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={e => handleSectionTextChange(sec.id, "heading", e.target.value)}
                            className="bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/40 outline-none text-[11px]"
                            placeholder="Heading label"
                          />
                          <input
                            type="text"
                            value={sec.description}
                            onChange={e => handleSectionTextChange(sec.id, "description", e.target.value)}
                            className="bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/40 outline-none text-[11px]"
                            placeholder="Brief snippet text"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-center">
                      <button
                        onClick={() => handleToggleSection(sec.id)}
                        className={`text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 transition border cursor-pointer ${
                          sec.visible
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {sec.visible ? "Hide Node" : "Show Node"}
                      </button>
                      <button
                        onClick={() => handleOrderSection(i, "up")}
                        disabled={i === 0}
                        className="p-1.5 bg-[#FAF6F0] hover:bg-[#DDD9D0] border border-[#CBBDA9]/40 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOrderSection(i, "down")}
                        disabled={i === settings.homepageSections.length - 1}
                        className="p-1.5 bg-[#FAF6F0] hover:bg-[#DDD9D0] border border-[#CBBDA9]/40 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. MENU LOOK APPEARANCE */}
          {activeTab === "menu" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Menu Catalogs Display Configuration</span>
                <p className="text-[11px] text-[#8C6D4F] font-light">Customise the general layout type, grid views/lists, card structure types, and label backgrounds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 border border-[#CBBDA9]/20 p-4 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Category Layout Style</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["grid", "list", "bento"].map(layout => (
                      <button
                        key={layout}
                        onClick={() => setSettings(prev => ({ ...prev, menuAppearance: { ...prev.menuAppearance, layout: layout as any } }))}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.menuAppearance.layout === layout
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 border border-[#CBBDA9]/20 p-4 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Menu Item Card Styling</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["classic", "minimal", "bordered"].map(style => (
                      <button
                        key={style}
                        onClick={() => setSettings(prev => ({ ...prev, menuAppearance: { ...prev.menuAppearance, cardStyle: style as any } }))}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.menuAppearance.cardStyle === style
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-[#8C6D4F] border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Immersive Gallery Architecture</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Configure fluid layouts, transitions, and mouse-hover animation triggers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-4 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Grid Alignment Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {["grid", "masonry"].map(lay => (
                      <button
                        key={lay}
                        onClick={() => setSettings(prev => ({ ...prev, gallery: { ...prev.gallery, layout: lay as any } }))}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.gallery.layout === lay
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {lay === "grid" ? "Strict Symmetrical Grid" : "Organic Masonry Layout"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 p-4 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Gallery Transition Method</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["fade", "slide", "zoom"].map(effect => (
                      <button
                        key={effect}
                        onClick={() => setSettings(prev => ({ ...prev, gallery: { ...prev.gallery, transitionEffect: effect as any } }))}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.gallery.transitionEffect === effect
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40"
                        }`}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. FOOTER MANAGEMENT */}
          {activeTab === "footer" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Global Footer Copywriting</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Edit footer brand descriptions, newsletter elements, and official copyright strings.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Footer Intro Paragraph description</label>
                  <textarea
                    rows={2}
                    value={settings.footer.text}
                    onChange={e => updateField("footer", "text", e.target.value)}
                    className="w-full bg-white p-2 border border-[#CBBDA9]/40 text-xs"
                    placeholder="Short description..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Copyright Footer String</label>
                  <input
                    type="text"
                    value={settings.footer.copyright}
                    onChange={e => updateField("footer", "copyright", e.target.value)}
                    className="w-full bg-white p-2 border border-[#CBBDA9]/40 text-xs"
                    placeholder="e.g. All Rights Reserved."
                  />
                </div>

                <div className="p-3.5 border border-[#CBBDA9]/10 bg-white rounded-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Newsletter Box Module</span>
                    <p className="text-[10px] text-gray-500 font-light">Show/hide newsletter subscription system in the footer.</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, footer: { ...prev.footer, newsletterEnabled: !prev.footer.newsletterEnabled } }))}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.footer.newsletterEnabled ? "bg-amber-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.footer.newsletterEnabled ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. NAVIGATION */}
          {activeTab === "navigation" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Navigation Bar Configuration</span>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">Control navbar stickiness and core navigation label tags.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 border border-[#CBBDA9]/10 bg-white rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Enforce Sticky Header</span>
                    <p className="text-[10px] text-gray-500 font-light">Lock navbar on top of screen on scroll.</p>
                  </div>
                  <button
                    onClick={() => updateField("navigation", "sticky", !settings.navigation.sticky)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.navigation.sticky ? "bg-amber-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.navigation.sticky ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="p-3.5 border border-[#CBBDA9]/10 bg-white rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Navbar Transparency</span>
                    <p className="text-[10px] text-gray-500 font-light">Render floating light/fade background on start.</p>
                  </div>
                  <button
                    onClick={() => updateField("navigation", "transparency", !settings.navigation.transparency)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.navigation.transparency ? "bg-amber-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.navigation.transparency ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="border border-[#CBBDA9]/20 p-4 bg-white rounded-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D4F] block mb-3">Navbar Link Items</span>
                <div className="space-y-2">
                  {settings.navigation.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] text-gray-400 font-mono w-4">#{idx+1}</span>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const updated = [...settings.navigation.items];
                          updated[idx].label = e.target.value;
                          updateField("navigation", "items", updated);
                        }}
                        className="bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/40 text-[11px] flex-grow"
                      />
                      <span className="text-[10px] text-slate-400 font-sans uppercase">TabTarget: {item.tabId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. SOCIAL MEDIA */}
          {activeTab === "socials" && (
            <div className="space-y-4 font-sans text-xs font-light">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Social Connection API & Platforms</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Input your active social coordinates. Icons automatically deploy instantly across client headers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(settings.socials).map(key => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block capitalize">{key} Profile URL</label>
                    <input
                      type="text"
                      value={(settings.socials as any)[key]}
                      onChange={e => updateField("socials", key, e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40 font-mono text-[11px]"
                      placeholder={`e.g. https://${key}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. PROMO BANNERS */}
          {activeTab === "promos" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Seasonal Promo & Special Banners</span>
                <p className="text-[11px] text-[#8C6D4F] mt-0.5">Toggle live slides, make events announcements, brunch countdowns, or seasonal menus promos visible on top of pages instantly.</p>
              </div>

              <div className="bg-white border border-[#CBBDA9]/20 p-4 rounded-xs space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D4F] block">Add New Promotional Announcement</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={bannerText}
                    onChange={e => setBannerText(e.target.value)}
                    className="w-full bg-[#FAF6F0] p-2.5 border border-[#CBBDA9]/40 text-xs text-[#4A3518] placeholder-[#C5A070]"
                    placeholder="Announcement banner text (e.g. Weekend roast starting soon!)..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      value={bannerType}
                      onChange={e => setBannerType(e.target.value as any)}
                      className="bg-[#FAF6F0] p-2 border border-[#CBBDA9]/40 text-xs"
                    >
                      <option value="brunch">Brunch Special </option>
                      <option value="events">Private Event </option>
                      <option value="seasonal">Seasonal Menu </option>
                      <option value="private">Private VIP dining</option>
                    </select>
                    <select
                      value={bannerLink}
                      onChange={e => setBannerLink(e.target.value)}
                      className="bg-[#FAF6F0] p-2 border border-[#CBBDA9]/40 text-xs text-[#4a3518]"
                    >
                      <option value="home">Go to La Maison (Home)</option>
                      <option value="menu">Go to Menu Catalog</option>
                      <option value="contact">Go to Hours & Valet</option>
                      <option value="reserve">Book Table Prompt</option>
                    </select>
                    <button
                      onClick={handleAddNewBanner}
                      className="bg-[#8E8274] hover:bg-[#706558] text-white uppercase text-[10px] tracking-wider py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Banner
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Configured Promos</span>
                {settings.customPromoBanners.map(ban => (
                  <div key={ban.id} className="flex items-center justify-between p-3 border border-[#CBBDA9]/30 bg-white">
                    <div className="pr-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1 text-[8px] tracking-wider uppercase font-extrabold bg-[#8C6D4F] text-white">
                          {ban.type}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">TargetTab: {ban.link}</span>
                      </div>
                      <p className="text-[11px] font-medium font-sans leading-snug">{ban.text}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleBannerState(ban.id)}
                        className={`text-[9px] uppercase font-bold tracking-wider py-1 px-2.5 border cursor-pointer ${
                          ban.active ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        {ban.active ? "Enabled" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(ban.id)}
                        className="text-red-700 hover:text-red-950 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. BUSINESS & CONTACT COORDINATES */}
          {activeTab === "business" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Location Coordinates & Business Info</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Control opening hours, address points, maps embed linkages, and direct calls.</p>
              </div>

              <div className="space-y-4.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Restaurant Address String</label>
                  <input
                    type="text"
                    value={settings.contact.address}
                    onChange={e => updateField("contact", "address", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 text-xs"
                    placeholder="Physical address..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Official Phone Number</label>
                    <input
                      type="text"
                      value={settings.contact.phone}
                      onChange={e => updateField("contact", "phone", e.target.value)}
                      className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Official Email Node</label>
                    <input
                      type="text"
                      value={settings.contact.email}
                      onChange={e => updateField("contact", "email", e.target.value)}
                      className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Reservation External App/Form Link</label>
                  <input
                    type="text"
                    value={settings.contact.reservationLink}
                    onChange={e => updateField("contact", "reservationLink", e.target.value)}
                    className="w-full bg-white p-2 border border-[#CBBDA9]/40 font-mono text-[11px]"
                    placeholder="e.g. OpenTable or custom"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 13. SEO METADATA */}
          {activeTab === "seo" && (
            <div className="space-y-4 font-sans text-xs font-light">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Search Engines SEO Customizer</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Control document headers, structured schemas, meta bots search queries, and keywords without code edits.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Page Head Title Tag</label>
                  <input
                    type="text"
                    value={settings.seo.pageTitle}
                    onChange={e => updateField("seo", "pageTitle", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 text-xs"
                    placeholder="Browser landing tag..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-bold block">Page Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seo.metaDescription}
                    onChange={e => updateField("seo", "metaDescription", e.target.value)}
                    className="w-full bg-white p-2.5 border border-[#CBBDA9]/40 text-xs"
                    placeholder="Meta description for google snippet..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">SEO Index keywords</label>
                    <input
                      type="text"
                      value={settings.seo.keywords}
                      onChange={e => updateField("seo", "keywords", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Structured Schema Graph (JSON)</label>
                    <input
                      type="text"
                      value={settings.seo.structuredData}
                      onChange={e => updateField("seo", "structuredData", e.target.value)}
                      className="w-full bg-white p-2 border border-[#CBBDA9]/40 font-mono text-[11px]"
                      placeholder="{}"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 14. ANIMATIONS CONFIG */}
          {activeTab === "animations" && (
            <div className="space-y-4 font-sans text-xs font-light">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">Motion Speed & Transition Styling</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Customise the general duration speeds, scroll reveals, and cinematic transitions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-[#CBBDA9]/20 bg-white rounded-xs">
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 block font-bold">Standard transition Speed</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["slow", "normal", "fast"].map(sp => (
                      <button
                        key={sp}
                        onClick={() => updateField("animations", "speed", sp)}
                        className={`p-2 border text-[10px] uppercase font-bold tracking-wider transition ${
                          settings.animations.speed === sp
                            ? "bg-[#8E8274] text-white border-transparent"
                            : "bg-transparent text-gray-600 border-[#CBBDA9]/40 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-[#CBBDA9]/20 bg-white rounded-xs flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">General Animations Enabled</span>
                      <p className="text-[10px] text-gray-500 font-light">Toggle animations universally on the site.</p>
                    </div>
                    <button
                      onClick={() => updateField("animations", "enabled", !settings.animations.enabled)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${settings.animations.enabled ? "bg-amber-600" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settings.animations.enabled ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 15. MEDIA LIBRARY */}
          {activeTab === "media" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 rounded-xs">
                <span className="font-serif font-bold text-[#8C6D4F]">CMS Media Organizer Library</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Central pool of visual brand items. Add high-contrast images or background loops to reuse throughout sections seamlessly.</p>
              </div>

              {activeSelectField && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs">
                  <p className="text-[11px] leading-tight flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Choose an asset below to insert into: <strong className="uppercase font-mono text-[10px]">{activeSelectField.section}.{activeSelectField.field}</strong></span>
                  </p>
                </div>
              )}

              <div className="border border-[#CBBDA9]/20 p-4 bg-white rounded-xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D4F] block">Upload/Organise New Media URL</span>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={uploadUrl}
                    onChange={e => setUploadUrl(e.target.value)}
                    className="w-full bg-[#FAF6F0] p-2 text-xs font-mono"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={uploadName}
                      onChange={e => setUploadName(e.target.value)}
                      className="bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/40 text-xs"
                      placeholder="Label name (e.g. Lobby Roast)"
                    />
                    <select
                      value={uploadType}
                      onChange={e => setUploadType(e.target.value as any)}
                      className="bg-[#FAF6F0] p-1.5 border border-[#CBBDA9]/40 text-xs text-[#4a3518]"
                    >
                      <option value="image">Image Format</option>
                      <option value="video">Video Format</option>
                    </select>
                    <button
                      onClick={handleAddMedia}
                      className="bg-[#8E8274] hover:bg-[#706558] text-white uppercase text-[10px] tracking-wider py-1.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Add to Assets
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                {settings.mediaLibrary.map(item => (
                  <div key={item.id} className="border border-[#CBBDA9]/30 bg-white group relative rounded-sm p-1">
                    <div className="aspect-square bg-[#FAF6F0] overflow-hidden relative">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#4A3518]/10">
                          <Play className="w-6 h-6 text-gold-400" />
                        </div>
                      )}

                      {/* Select Media Trigger Overlay */}
                      {activeSelectField ? (
                        <button
                          onClick={() => handleApplyMedia(item.url)}
                          className="absolute inset-0 bg-amber-600/60 backdrop-blur-xs flex items-center justify-center font-sans text-white text-[10px] uppercase tracking-widest font-bold font-mono opacity-0 group-hover:opacity-100 transition duration-300"
                        >
                          Use Asset
                        </button>
                      ) : (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-between">
                          <span className="text-[9px] text-[#FCFAF7] font-semibold truncate max-w-[80px]">{item.name}</span>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: RICH REAL-TIME CMS PREVIEW PANEL */}
      <div className="xl:col-span-5 flex flex-col space-y-4">
        
        {/* PREVIEW CONTAINER */}
        <div className="border border-[#CBBDA9] bg-[#FAF6F0] p-1 luxury-glow sticky top-24 rounded-xs overflow-hidden">
          
          {/* DEVICE PREVIEW BAR HEADER */}
          <div className="bg-[#FCFAF5] p-3 border-b border-[#CBBDA9]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-sans text-[10px] text-[#4A3518] uppercase tracking-widest font-bold">
                CMS Real-Time Live Preview Frame
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* LIVE SIMULATIVE FRAME MOCK WITH PREVIEW STYLING INJECTED */}
          <div className="h-[580px] overflow-y-auto overflow-x-hidden p-0 relative bg-amber-950/5">
            
            {/* INJECT DYNAMIC LIVE USER CUSTOMIZATION VALUES */}
            <div
              style={{
                fontFamily: settings.typography.headingFont === "Inter" ? "Inter" : "Cormorant Garamond, Georgia, serif",
                color: settings.colors.primaryColor,
                backgroundColor: settings.colors.backgroundColor
              }}
              className="min-h-full font-light relative pb-10 transition-all duration-300"
            >
              
              {/* BRAND BANNERS */}
              {settings.customPromoBanners.filter(b => b.active).map((b, bIdx) => (
                <div
                  key={b.id}
                  style={{ backgroundColor: settings.colors.goldAccent, color: settings.colors.primaryColor }}
                  className="p-2 text-center text-[10px] tracking-wider uppercase font-semibold border-b border-[#CBBDA9]/10"
                >
                  {b.text}
                </div>
              ))}

              {/* NAVIGATION MOCK BAR */}
              <nav className="p-4 border-b border-[#CBBDA9]/20 flex items-center justify-between" style={{ backgroundColor: settings.colors.panelColor }}>
                <span className="font-bold text-center tracking-[0.16em] text-[15px]" style={{ color: settings.colors.primaryColor }}>
                  {settings.branding.brandName || "ONA LAGOS"}
                </span>
                <div className="flex gap-3 text-[9px] uppercase tracking-widest text-[#8C6D4F] font-semibold">
                  {settings.navigation.items.slice(0, 4).map((ni, iIdx) => (
                    <span key={iIdx} className="hover:underline cursor-pointer">{ni.label}</span>
                  ))}
                </div>
              </nav>

              {/* HERO ZONE */}
              <div className="relative py-14 px-6 text-center border-b border-[#CBBDA9]/20 bg-cover bg-center overflow-hidden flex flex-col items-center justify-center"
                   style={{ backgroundImage: `url(${settings.hero.backgroundImage})` }}>
                
                {/* Overlay Darkness logic */}
                {settings.hero.toggleOverlay && (
                  <div className="absolute inset-0 bg-black" style={{ opacity: `${settings.hero.overlayOpacity}%` }} />
                )}

                <div className="relative z-10 space-y-4 max-w-lg text-white">
                  
                  {/* Dynamic Render Order defined by customized array */}
                  {settings.hero.contentOrder.map((orderItem) => {
                    if (orderItem === "title") {
                      return (
                        <h3 key="title" className="text-2xl md:text-3.5xl font-light leading-tight font-serif tracking-wide text-white">
                          {settings.hero.title}
                        </h3>
                      );
                    }
                    if (orderItem === "subtitle") {
                      return (
                        <p key="subtitle" className="text-[11px] font-sans text-gray-200 leading-relaxed font-light">
                          {settings.hero.subtitle}
                        </p>
                      );
                    }
                    if (orderItem === "cta") {
                      return (
                        <button
                          key="cta"
                          style={{
                            backgroundColor: settings.colors.goldAccent,
                            color: settings.colors.primaryColor,
                            borderRadius: settings.colors.buttonStyle === "pill" ? "9999px" : settings.colors.buttonStyle === "rounded" ? "4px" : "0px"
                          }}
                          className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold shadow-md cursor-pointer border-0 inline-block mt-2"
                        >
                          {settings.hero.ctaText}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* HOME SECTIONS FEED MOCK */}
              <div className="p-6 space-y-8 max-w-md mx-auto">
                {settings.homepageSections.filter(s => s.visible).map((s, sIdx) => (
                  <div key={s.id} className="space-y-2 border-b border-[#CBBDA9]/15 pb-4">
                    <span style={{ color: settings.colors.goldAccent }} className="text-[9px] uppercase tracking-[0.25em] font-bold block">{s.heading}</span>
                    <h4 className="text-lg font-light" style={{ color: settings.colors.primaryColor }}>{s.name} Module</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed" style={{ fontFamily: settings.typography.bodyFont }}>{s.description}</p>
                    {s.bgImage && (
                      <img src={s.bgImage} className="w-full h-24 object-cover mt-2 rounded" referrerPolicy="no-referrer" />
                    )}
                  </div>
                ))}
              </div>

              {/* FOOTER ZONE */}
              <footer className="p-6 border-t border-[#CBBDA9]/20" style={{ backgroundColor: settings.colors.panelColor }}>
                <div className="space-y-4 text-center">
                  <span className="font-serif tracking-widest text-sm block" style={{ color: settings.colors.primaryColor }}>{settings.branding.brandName}</span>
                  <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-normal">{settings.footer.text}</p>
                  
                  {settings.footer.newsletterEnabled && (
                    <div className="flex gap-1 max-w-xs mx-auto pt-1">
                      <input type="text" placeholder="Invite your inbox..." className="bg-white p-1 text-[10px] flex-grow border border-gray-300" disabled />
                      <button className="text-[9px] bg-[#8E8274] text-white p-1.5 uppercase font-bold" disabled>Join</button>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 text-xs text-[#8C6D4F] font-bold">
                    <span>Instagram</span>
                    <span>Tiktok</span>
                    <span>WhatsApp</span>
                  </div>
                  <span className="text-[9px] text-gray-400 block pt-2">{settings.footer.copyright}</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
