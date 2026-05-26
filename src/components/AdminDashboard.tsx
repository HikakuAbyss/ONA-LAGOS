import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  CalendarDays,
  UtensilsCrossed,
  Baby,
  HeartCrack,
  Building,
  Camera,
  Mail,
  Clock,
  FileText,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  ShieldAlert,
  Download,
  Search,
  CheckCircle,
  X,
  Lock,
  Eye,
  LogOut,
  Info,
  Sliders,
  AlertTriangle,
  Globe,
  Share2,
  Award,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  CheckSquare,
  LockKeyhole,
  Palette,
  Database,
  ShoppingBag
} from "lucide-react";
import { MenuItem, GalleryItem, Testimonial, MENU_ITEMS, GALLERY_ITEMS, TESTIMONIALS } from "../types";
import WebsiteCustomizer from "./WebsiteCustomizer";
import ContentManager from "./ContentManager";
import OnaLifestyleManager from "./OnaLifestyleManager";

// Firebase Imports
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs
} from "firebase/firestore";

// Convex Hooks & API
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";


// Local Type Definitions for local or database mapping
export type AdminRole = "Super Admin" | "Manager" | "Content Editor" | "Reservation Staff" | "User";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "Active" | "Suspended";
  addedAt: string;
}

export interface ReservationEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  type: string;
  status: "Pending" | "Confirmed" | "Seated" | "Cancelled";
  notes?: string;
  internalNotes?: string;
}

export interface DiningEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  type: "Private Birthday" | "Corporate Gala" | "Proposal Setup" | "Anniversary" | "Other";
  status: "Pending" | "Contacted" | "Confirmed" | "Cancelled";
  details: string;
  internalNotes?: string;
}

export interface MovieShootEnquiry {
  id: string;
  producer: string;
  company: string;
  phone: string;
  email: string;
  shootDate: string;
  durationHours: number;
  crewSize: number;
  shootType: "Movie Scene" | "Commercial" | "High Fashion" | "Pre-Wedding";
  status: "Pending" | "Contacted" | "Approved" | "Cancelled";
  description: string;
  budgetEst?: string;
  internalNotes?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "Unread" | "Read" | "Replied";
}

interface AdminDashboardProps {
  onSettingsUpdate?: () => void;
  onCloseAdmin?: () => void;
}

export default function AdminDashboard({ onSettingsUpdate, onCloseAdmin }: AdminDashboardProps) {
  // Session State backed by real Firebase Auth
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activePanel, setActivePanel] = useState<string>("overview");
  const [loading, setLoading] = useState(true);

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Firestore Synchronized Collections
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reservations, setReservations] = useState<ReservationEnquiry[]>([]);
  const [privateDining, setPrivateDining] = useState<DiningEnquiry[]>([]);
  const [movieShoots, setMovieShoots] = useState<MovieShootEnquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  
  const [openingHoursList, setOpeningHoursList] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState({
    reservationAppLink: "https://reserve.onalagos.com",
    whatsappNumber: "+234 90 6000 ONA",
    phoneNumber: "+234 (0) 90 ONA LAGOS",
    emailAddress: "concierge@onalagos.com",
    physicalAddress: "14B Karimu Kotun St, Victoria Island, Lagos, Nigeria",
    instagramLink: "https://instagram.com/ona_lagos",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.730335029302!2d3.424367!3d6.428131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b327b5bd519%3A0xeebd5bdcd53e9fde!2sKarimu%20Kotun%20St%2C%20Clifton%20Oasis!5e0!3m2!1sen!2sng!4v1700000000000",
    heroHeadline: "Where Heritage Meets High Gastronomy",
    heroSub: "An architectural masterwork of fine culture and sensory chemistry located in Victoria Island, Lagos."
  });

  // Check if Mock session is active
  const isMock = currentUser?.id === "demo_admin" || currentUser?.id?.startsWith("mock_") || !!localStorage.getItem("ona_mock_user");

  // Convex React queries
  const convexUsers = useQuery(api.users.list);
  const convexMenu = useQuery(api.menu.getItems);
  const convexGallery = useQuery(api.gallery.getItems);
  const convexTestimonials = useQuery(api.testimonials.list);
  const convexReservations = useQuery(api.reservations.list);
  const convexEnquiries = useQuery(api.enquiries.list);
  const convexMessages = useQuery(api.messages.list);
  const convexSettings = useQuery(api.settings.getByKey, { key: "operational" });

  // Convex React mutations
  const convexCreateUser = useMutation(api.users.createUser);
  const convexUpdateUserRole = useMutation(api.users.updateRole);
  const convexUpdateUserStatus = useMutation(api.users.updateStatus);
  const convexDeleteUser = useMutation(api.users.deleteUser);

  const convexCreateMenuItem = useMutation(api.menu.createItem);
  const convexUpdateMenuItem = useMutation(api.menu.updateItem);
  const convexDeleteMenuItem = useMutation(api.menu.deleteItem);

  const convexCreateGalleryItem = useMutation(api.gallery.createItem);
  const convexUpdateGalleryItem = useMutation(api.gallery.updateItem);
  const convexDeleteGalleryItem = useMutation(api.gallery.deleteItem);

  const convexCreateTestimonial = useMutation(api.testimonials.create);
  const convexDeleteTestimonial = useMutation(api.testimonials.deleteTestimonial);

  const convexUpdateReservationStatus = useMutation(api.reservations.updateStatus);
  const convexDeleteReservation = useMutation(api.reservations.deleteReservation);

  const convexUpdateEnquiryStatus = useMutation(api.enquiries.updateStatus);
  const convexDeleteEnquiry = useMutation(api.enquiries.deleteEnquiry);

  const convexUpdateMessageStatus = useMutation(api.messages.updateStatus);
  const convexDeleteMessage = useMutation(api.messages.deleteMessage);

  const convexSetSetting = useMutation(api.settings.setByKey);

  // Reactively sync Convex queries to the local state
  useEffect(() => {
    if (!isMock && convexUsers && convexUsers.success && convexUsers.data) {
      setAdmins(convexUsers.data.map((u: any) => ({ ...u, id: u._id })));
    }
  }, [convexUsers, isMock]);

  useEffect(() => {
    if (!isMock && convexMenu && convexMenu.success && convexMenu.data) {
      setMenuItems(convexMenu.data.map((m: any) => ({ ...m, id: m._id })));
    }
  }, [convexMenu, isMock]);

  useEffect(() => {
    if (!isMock && convexGallery && convexGallery.success && convexGallery.data) {
      setGalleryItems(convexGallery.data.map((g: any) => ({ ...g, id: g._id })));
    }
  }, [convexGallery, isMock]);

  useEffect(() => {
    if (!isMock && convexTestimonials && convexTestimonials.success && convexTestimonials.data) {
      setTestimonials(convexTestimonials.data.map((t: any) => ({ ...t, id: t._id })));
    }
  }, [convexTestimonials, isMock]);

  useEffect(() => {
    if (!isMock && convexReservations && convexReservations.success && convexReservations.data) {
      setReservations(convexReservations.data.map((r: any) => ({ ...r, id: r._id })));
    }
  }, [convexReservations, isMock]);

  useEffect(() => {
    if (!isMock && convexEnquiries && convexEnquiries.success && convexEnquiries.data) {
      const allEnqs = convexEnquiries.data;
      const diningList = allEnqs.filter((e: any) => e.type !== "Movie Scene" && e.type !== "Commercial" && e.type !== "High Fashion" && e.type !== "Pre-Wedding");
      const shootList = allEnqs.filter((e: any) => e.type === "Movie Scene" || e.type === "Commercial" || e.type === "High Fashion" || e.type === "Pre-Wedding");
      
      setPrivateDining(diningList.map((e: any) => ({ ...e, id: e._id })));
      setMovieShoots(shootList.map((e: any) => ({
        id: e._id,
        producer: e.name,
        company: e.company || "",
        phone: e.phone,
        email: e.email,
        shootDate: e.date,
        durationHours: e.durationHours || 4,
        crewSize: e.guests,
        shootType: e.type,
        status: e.status,
        description: e.details || ""
      })));
    }
  }, [convexEnquiries, isMock]);

  useEffect(() => {
    if (!isMock && convexMessages && convexMessages.success && convexMessages.data) {
      setMessages(convexMessages.data.map((m: any) => ({ ...m, id: m._id })));
    }
  }, [convexMessages, isMock]);

  useEffect(() => {
    if (!isMock && convexSettings && convexSettings.success && convexSettings.data) {
      setAppSettings(convexSettings.data);
    }
  }, [convexSettings, isMock]);

  // WRAPPERS for persistent mockup writes
  const setDocWrapper = async (docRef: any, data: any) => {
    if (isMock) {
      const path = docRef._path?.segments || [];
      const collectionName = path[0];
      const docId = path[1];
      
      if (!collectionName || !docId) return;

      if (collectionName === "menu_items") {
        const updated = menuItems.some(item => item.id === docId)
          ? menuItems.map(item => item.id === docId ? data : item)
          : [...menuItems, data];
        setMenuItems(updated);
        localStorage.setItem("ona_mock_menu_items", JSON.stringify(updated));
      } else if (collectionName === "users") {
        const updated = admins.some(item => item.id === docId)
          ? admins.map(item => item.id === docId ? data : item)
          : [...admins, data];
        setAdmins(updated);
        localStorage.setItem("ona_mock_users", JSON.stringify(updated));
      } else if (collectionName === "testimonials") {
        const updated = testimonials.some(item => item.name === data.name)
          ? testimonials.map(item => item.name === data.name ? data : item)
          : [...testimonials, data];
        setTestimonials(updated);
        localStorage.setItem("ona_mock_testimonials", JSON.stringify(updated));
      } else if (collectionName === "reservations") {
        const updated = reservations.some(item => item.id === docId)
          ? reservations.map(item => item.id === docId ? data : item)
          : [...reservations, data];
        setReservations(updated);
        localStorage.setItem("ona_mock_reservations", JSON.stringify(updated));
      } else if (collectionName === "event_enquiries") {
        const isShoot = data.type === "Movie Scene" || data.type === "Commercial" || data.type === "High Fashion" || data.type === "Pre-Wedding";
        if (isShoot) {
          const shootData: MovieShootEnquiry = {
            id: data.id,
            producer: data.producer || data.name || "Independent",
            company: data.company || "Independent",
            phone: data.phone,
            email: data.email,
            shootDate: data.shootDate || data.date,
            durationHours: data.durationHours || data.duration || 4,
            crewSize: data.crewSize || data.guests || 10,
            shootType: data.shootType || data.type,
            status: data.status,
            description: data.description || data.details || ""
          };
          const updated = movieShoots.some(item => item.id === docId)
            ? movieShoots.map(item => item.id === docId ? shootData : item)
            : [...movieShoots, shootData];
          setMovieShoots(updated);
          localStorage.setItem("ona_mock_movie_shoots", JSON.stringify(updated));
        } else {
          const updated = privateDining.some(item => item.id === docId)
            ? privateDining.map(item => item.id === docId ? data : item)
            : [...privateDining, data];
          setPrivateDining(updated);
          localStorage.setItem("ona_mock_private_dining", JSON.stringify(updated));
        }
      } else if (collectionName === "contact_messages") {
        const updated = messages.some(item => item.id === docId)
          ? messages.map(item => item.id === docId ? data : item)
          : [...messages, data];
        setMessages(updated);
        localStorage.setItem("ona_mock_messages", JSON.stringify(updated));
      } else if (collectionName === "admin_settings") {
        setAppSettings(data);
        localStorage.setItem("ona_mock_operational_settings", JSON.stringify(data));
      }
      return;
    }

    const path = docRef._path?.segments || [];
    const collectionName = path[0];
    const docId = path[1];
    if (!collectionName) return;

    if (collectionName === "menu_items") {
      if (docId && !docId.startsWith("menu_")) {
        await convexUpdateMenuItem({
          id: docId as any,
          name: data.name,
          description: data.description,
          price: data.price,
          categories: data.categories,
          dietary: data.dietary,
          image: data.image
        });
      } else {
        await convexCreateMenuItem({
          name: data.name,
          description: data.description,
          price: data.price,
          categories: data.categories,
          dietary: data.dietary,
          image: data.image
        });
      }
    } else if (collectionName === "users") {
      if (docId && !docId.startsWith("staff_")) {
        await convexUpdateUserRole({ userId: docId as any, role: data.role });
        await convexUpdateUserStatus({ userId: docId as any, status: data.status });
      } else {
        await convexCreateUser({
          name: data.name,
          email: data.email,
          role: data.role
        });
      }
    } else if (collectionName === "testimonials") {
      await convexCreateTestimonial({
        name: data.name,
        role: data.role,
        comment: data.comment,
        rating: data.rating
      });
    } else if (collectionName === "reservations") {
      await convexUpdateReservationStatus({
        id: docId as any,
        status: data.status,
        internalNotes: data.internalNotes
      });
    } else if (collectionName === "event_enquiries") {
      await convexUpdateEnquiryStatus({
        id: docId as any,
        status: data.status,
        internalNotes: data.internalNotes
      });
    } else if (collectionName === "contact_messages") {
      await convexUpdateMessageStatus({
        id: docId as any,
        status: data.status
      });
    } else if (collectionName === "admin_settings" && docId === "operational") {
      await convexSetSetting({
        key: "operational",
        data
      });
    }
  };

  const updateDocWrapper = async (docRef: any, data: any) => {
    if (isMock) {
      const path = docRef._path?.segments || [];
      const collectionName = path[0];
      const docId = path[1];

      if (!collectionName || !docId) return;

      if (collectionName === "users") {
        const updated = admins.map(item => item.id === docId ? { ...item, ...data } : item);
        setAdmins(updated);
        localStorage.setItem("ona_mock_users", JSON.stringify(updated));
      } else if (collectionName === "reservations") {
        const updated = reservations.map(item => item.id === docId ? { ...item, ...data } : item);
        setReservations(updated);
        localStorage.setItem("ona_mock_reservations", JSON.stringify(updated));
      } else if (collectionName === "event_enquiries") {
        const foundPriv = privateDining.find(p => p.id === docId);
        if (foundPriv) {
          const updated = privateDining.map(item => item.id === docId ? { ...item, ...data } : item);
          setPrivateDining(updated);
          localStorage.setItem("ona_mock_private_dining", JSON.stringify(updated));
        } else {
          const updated = movieShoots.map(item => item.id === docId ? { ...item, ...data } : item);
          setMovieShoots(updated);
          localStorage.setItem("ona_mock_movie_shoots", JSON.stringify(updated));
        }
      } else if (collectionName === "contact_messages") {
        const updated = messages.map(item => item.id === docId ? { ...item, ...data } : item);
        setMessages(updated);
        localStorage.setItem("ona_mock_messages", JSON.stringify(updated));
      }
      return;
    }

    const path = docRef._path?.segments || [];
    const collectionName = path[0];
    const docId = path[1];
    if (!collectionName || !docId) return;

    if (collectionName === "users") {
      if (data.role) {
        await convexUpdateUserRole({ userId: docId as any, role: data.role });
      }
      if (data.status) {
        await convexUpdateUserStatus({ userId: docId as any, status: data.status });
      }
    } else if (collectionName === "reservations") {
      await convexUpdateReservationStatus({
        id: docId as any,
        status: data.status,
        internalNotes: data.internalNotes
      });
    } else if (collectionName === "event_enquiries") {
      await convexUpdateEnquiryStatus({
        id: docId as any,
        status: data.status,
        internalNotes: data.internalNotes
      });
    } else if (collectionName === "contact_messages") {
      await convexUpdateMessageStatus({
        id: docId as any,
        status: data.status
      });
    }
  };

  const deleteDocWrapper = async (docRef: any) => {
    if (isMock) {
      const path = docRef._path?.segments || [];
      const collectionName = path[0];
      const docId = path[1];

      if (!collectionName || !docId) return;

      if (collectionName === "menu_items") {
        const updated = menuItems.filter(item => item.id !== docId);
        setMenuItems(updated);
        localStorage.setItem("ona_mock_menu_items", JSON.stringify(updated));
      } else if (collectionName === "users") {
        const updated = admins.filter(item => item.id !== docId);
        setAdmins(updated);
        localStorage.setItem("ona_mock_users", JSON.stringify(updated));
      } else if (collectionName === "testimonials") {
        const updated = testimonials.filter(item => item.name.replace(/[^a-zA-Z0-9]/g, "_") !== docId);
        setTestimonials(updated);
        localStorage.setItem("ona_mock_testimonials", JSON.stringify(updated));
      }
      return;
    }

    const path = docRef._path?.segments || [];
    const collectionName = path[0];
    const docId = path[1];
    if (!collectionName || !docId) return;

    if (collectionName === "menu_items") {
      await convexDeleteMenuItem({ id: docId as any });
    } else if (collectionName === "users") {
      await convexDeleteUser({ userId: docId as any });
    } else if (collectionName === "testimonials") {
      await convexDeleteTestimonial({ id: docId as any });
    }
  };


  // Track Firebase/Mock auth state and sync workspace
  useEffect(() => {
    const savedMockProfile = localStorage.getItem("ona_mock_user");
    if (savedMockProfile) {
      const parsed = JSON.parse(savedMockProfile);
      const savedMockRole = localStorage.getItem("ona_mock_role") || "Super Admin";
      setCurrentUser({
        id: parsed.uid || "demo_admin",
        name: parsed.displayName || "Demo Admin",
        email: parsed.email || "admin@gmail.com",
        role: savedMockRole as any,
        status: "Active",
        addedAt: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (localStorage.getItem("ona_mock_user")) return; // Skip if mock is active

      if (fbUser) {
        // Sync user role from db
        const userRef = doc(db, "users", fbUser.uid);
        try {
          // Double check super admin email maps
          const bootstrapped = ["officialdananj@gmail.com", "officialdiodan@gmail.com"];
          let userRole: AdminRole = "User";
          
          if (fbUser.email && bootstrapped.includes(fbUser.email.trim().toLowerCase())) {
            userRole = "Super Admin";
          }

          // Fetch snapshot
          const { getDoc } = await import("firebase/firestore");
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            const data = snap.data();
            if (data.status === "Suspended") {
              signOut(auth);
              setLoginError("This user account has been suspended.");
              setCurrentUser(null);
            } else {
              setCurrentUser({
                id: fbUser.uid,
                name: data.name || fbUser.displayName || "Admin Officer",
                email: fbUser.email || "",
                role: data.role || userRole,
                status: "Active",
                addedAt: data.addedAt || new Date().toISOString()
              });
            }
          } else {
            // Write first-time user profile
            const profile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Administrator",
              email: fbUser.email || "",
              role: userRole,
              status: "Active",
              addedAt: new Date().toISOString()
            };
            await setDoc(userRef, profile);
            setCurrentUser(profile as any);
          }
        } catch (e) {
          console.warn("Error reading users snapshot, compiling memory backup role:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Sync collections in real-time or local storage cache
  useEffect(() => {
    if (!currentUser) return;

    if (isMock) {
      // 1. Admins/Users
      const localAdmins = localStorage.getItem("ona_mock_users");
      const defaultAdmins: AdminUser[] = [
        { id: "demo_admin", name: "Demo Admin", email: "admin@gmail.com", role: "Super Admin", status: "Active", addedAt: new Date().toISOString() }
      ];
      if (localAdmins) {
        setAdmins(JSON.parse(localAdmins));
      } else {
        localStorage.setItem("ona_mock_users", JSON.stringify(defaultAdmins));
        setAdmins(defaultAdmins);
      }

      // 2. Menu Items
      const localMenu = localStorage.getItem("ona_mock_menu_items");
      if (localMenu) {
        setMenuItems(JSON.parse(localMenu));
      } else {
        localStorage.setItem("ona_mock_menu_items", JSON.stringify(MENU_ITEMS));
        setMenuItems(MENU_ITEMS);
      }

      // 3. Gallery Items
      const localGallery = localStorage.getItem("ona_mock_gallery_items");
      if (localGallery) {
        setGalleryItems(JSON.parse(localGallery));
      } else {
        localStorage.setItem("ona_mock_gallery_items", JSON.stringify(GALLERY_ITEMS));
        setGalleryItems(GALLERY_ITEMS);
      }

      // 4. Testimonials
      const localTestimonials = localStorage.getItem("ona_mock_testimonials");
      if (localTestimonials) {
        setTestimonials(JSON.parse(localTestimonials));
      } else {
        localStorage.setItem("ona_mock_testimonials", JSON.stringify(TESTIMONIALS));
        setTestimonials(TESTIMONIALS);
      }

      // 5. Reservations
      const localRes = localStorage.getItem("ona_mock_reservations");
      const defaultRes: ReservationEnquiry[] = [
        { id: "res_1", name: "Chief Adeleke Victor", email: "adeleke@lagosoil.com", phone: "+234 803 111 2222", date: "2026-06-11", time: "19:30", guests: 6, type: "Sunday Roast", status: "Confirmed", notes: "VIP table requested" },
        { id: "res_2", name: "Dr. Michelle Williams", email: "michelle@embassy.org", phone: "+234 902 444 8888", date: "2026-06-12", time: "20:00", guests: 2, type: "Standard Dining", status: "Confirmed", notes: "Window seat overlooking courtyard" }
      ];
      if (localRes) {
        setReservations(JSON.parse(localRes));
      } else {
        localStorage.setItem("ona_mock_reservations", JSON.stringify(defaultRes));
        setReservations(defaultRes);
      }

      // 6. Private Dining
      const localDining = localStorage.getItem("ona_mock_private_dining");
      const defaultDining: DiningEnquiry[] = [
        { id: "pvt_1", name: "Fatima Dangote", email: "fatima@dangote.com", phone: "+234 803 211 4444", date: "2026-06-18", guests: 18, type: "Corporate Gala", status: "Confirmed", details: "Exclusive sensory dining corporate celebrating. Security details arranged." }
      ];
      if (localDining) {
        setPrivateDining(JSON.parse(localDining));
      } else {
        localStorage.setItem("ona_mock_private_dining", JSON.stringify(defaultDining));
        setPrivateDining(defaultDining);
      }

      // 7. Movie Shoots
      const localShoots = localStorage.getItem("ona_mock_movie_shoots");
      const defaultShoots: MovieShootEnquiry[] = [
        { id: "sht_1", producer: "Funke Akindele", company: "SceneOne Productions", phone: "+234 803 999 8888", email: "funke@sceneone.tv", shootDate: "2026-06-25", durationHours: 6, crewSize: 35, shootType: "Movie Scene", status: "Approved", description: "Billionaire high-society sequence." }
      ];
      if (localShoots) {
        setMovieShoots(JSON.parse(localShoots));
      } else {
        localStorage.setItem("ona_mock_movie_shoots", JSON.stringify(defaultShoots));
        setMovieShoots(defaultShoots);
      }

      // 8. Contact Messages
      const localMessages = localStorage.getItem("ona_mock_messages");
      const defaultMessages: ContactMessage[] = [
        { id: "msg_1", name: "Chinedu Cole", email: "chinedu@vip.com", subject: "Pre-Booking Dom Pérignon cases", message: "Do you have case limits for Sundays?", date: "2026-05-23", status: "Unread" }
      ];
      if (localMessages) {
        setMessages(JSON.parse(localMessages));
      } else {
        localStorage.setItem("ona_mock_messages", JSON.stringify(defaultMessages));
        setMessages(defaultMessages);
      }

      // 9. Operational Settings
      const localSettings = localStorage.getItem("ona_mock_operational_settings");
      const defaultAppSettings = {
        reservationAppLink: "https://reserve.onalagos.com",
        whatsappNumber: "+234 90 6000 ONA",
        phoneNumber: "+234 (0) 90 ONA LAGOS",
        emailAddress: "concierge@onalagos.com",
        physicalAddress: "14B Karimu Kotun St, Victoria Island, Lagos, Nigeria",
        instagramLink: "https://instagram.com/ona_lagos",
        googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.730335029302!2d3.424367!3d6.428131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b327b5bd519%3A0xeebd5bdcd53e9fde!2sKarimu%20Kotun%20St%2C%20Clifton%20Oasis!5e0!3m2!1sen!2sng!4v1700000000000",
        heroHeadline: "Where Heritage Meets High Gastronomy",
        heroSub: "An architectural masterwork of fine culture and sensory chemistry located in Victoria Island, Lagos."
      };
      if (localSettings) {
        setAppSettings(JSON.parse(localSettings));
      } else {
        localStorage.setItem("ona_mock_operational_settings", JSON.stringify(defaultAppSettings));
        setAppSettings(defaultAppSettings);
      }

      return;
    }
    // Real Convex mode will be synced reactively by useQuery hooks at top level.
    // No manual onSnapshot listeners needed here.
  }, [currentUser]);

  // Sign In Trigger via Firebase or Local Mock Auth
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess(true);

    const checkEmail = loginEmail.trim().toLowerCase();

    // INTERCEPT: Demo Admin Account
    if (checkEmail === "admin@gmail.com") {
      if (loginPassword === "admin1234") {
        const mockProfile = {
          uid: "demo_admin",
          email: "admin@gmail.com",
          displayName: "Demo Admin",
          isMock: true
        };
        localStorage.setItem("ona_mock_user", JSON.stringify(mockProfile));
        localStorage.setItem("ona_mock_role", "Super Admin");

        setCurrentUser({
          id: "demo_admin",
          name: "Demo Admin",
          email: "admin@gmail.com",
          role: "Super Admin",
          status: "Active",
          addedAt: new Date().toISOString()
        });
        setLoginSuccess(false);
        return;
      } else {
        setLoginError("Invalid password for Demo Admin.");
        setLoginSuccess(false);
        return;
      }
    }

    // Intercept: Local Mock Users registration and login
    const savedMockUsers = localStorage.getItem("ona_mock_users_db");
    const usersList = savedMockUsers ? JSON.parse(savedMockUsers) : [];
    const matched = usersList.find((u: any) => u.email === checkEmail && u.password === loginPassword);
    
    if (matched) {
      const mockProfile = {
        uid: "mock_" + matched.fullName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
        email: checkEmail,
        displayName: matched.fullName,
        isMock: true
      };
      localStorage.setItem("ona_mock_user", JSON.stringify(mockProfile));
      localStorage.setItem("ona_mock_role", matched.role || "User");

      setCurrentUser({
        id: mockProfile.uid,
        name: matched.fullName,
        email: matched.email,
        role: (matched.role || "User") as any,
        status: "Active",
        addedAt: matched.addedAt || new Date().toISOString()
      });
      setLoginSuccess(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
    } catch (e: any) {
      console.error(e);
      setLoginError("Invalid email or password combination.");
      setLoginSuccess(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("ona_mock_user");
    localStorage.removeItem("ona_mock_role");
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
  };

  // ROLE-BASED ACCESS CONTROL (RBAC) CHECK
  const hasAccess = (requiredRoles: AdminRole[]) => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case "Super Admin": return "bg-rose-500/10 border-rose-400/30 text-rose-700 font-bold";
      case "Manager": return "bg-amber-500/10 border-amber-400/30 text-amber-700 font-medium";
      case "Content Editor": return "bg-sky-500/10 border-sky-400/30 text-sky-700";
      case "Reservation Staff": return "bg-emerald-500/10 border-emerald-400/20 text-emerald-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  // CRUD OPERATIONS FOR CORE PANEL AREAS
  // 1. Menu Items CRUD
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [menuFormName, setMenuFormName] = useState("");
  const [menuFormDesc, setMenuFormDesc] = useState("");
  const [menuFormPrice, setMenuFormPrice] = useState("");
  const [menuFormCategories, setMenuFormCategories] = useState<string[]>([]);
  const [menuFormImage, setMenuFormImage] = useState("");
  const [menuFormIsVeh, setMenuFormIsVeh] = useState(false);
  const [menuFormIsVeg, setMenuFormIsVeg] = useState(false);
  const [menuFormIsGF, setMenuFormIsGF] = useState(false);
  const [menuFormIsSpicy, setMenuFormIsSpicy] = useState(false);
  const [menuFormIsKids, setMenuFormIsKids] = useState(false);
  const [menuFormAllergies, setMenuFormAllergies] = useState("");

  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuFormName("");
    setMenuFormDesc("");
    setMenuFormPrice("₦18,500");
    setMenuFormCategories(["starters"]);
    setMenuFormImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80");
    setMenuFormIsVeh(false);
    setMenuFormIsVeg(false);
    setMenuFormIsGF(false);
    setMenuFormIsSpicy(false);
    setMenuFormIsKids(false);
    setMenuFormAllergies("");
    setIsMenuFormOpen(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuFormName(item.name);
    setMenuFormDesc(item.description);
    setMenuFormPrice(item.price);
    setMenuFormCategories(item.categories);
    setMenuFormImage(item.image);
    setMenuFormIsVeh(!!item.dietary?.isVegetarian);
    setMenuFormIsVeg(!!item.dietary?.isVegan);
    setMenuFormIsGF(!!item.dietary?.isGlutenFree);
    setMenuFormIsSpicy(!!item.dietary?.isSpicy);
    setMenuFormIsKids(item.categories.includes("kids") || !!item.dietary?.isKidsFriendly);
    setMenuFormAllergies(item.dietary?.hasNuts ? "Contains Groundnuts" : "");
    setIsMenuFormOpen(true);
  };

  const handleSaveMenuItem = async () => {
    if (!menuFormName.trim()) return;
    const finalId = editingMenuItem ? editingMenuItem.id : "menu_" + Date.now();
    
    let finalCats = [...menuFormCategories];
    if (menuFormIsKids && !finalCats.includes("kids")) {
      finalCats.push("kids");
    }

    const itemData: MenuItem = {
      id: finalId,
      name: menuFormName,
      description: menuFormDesc,
      price: menuFormPrice,
      categories: finalCats as any[],
      dietary: {
        isVegetarian: menuFormIsVeh,
        isVegan: menuFormIsVeg,
        isGlutenFree: menuFormIsGF,
        isSpicy: menuFormIsSpicy,
        isKidsFriendly: menuFormIsKids,
        hasNuts: menuFormAllergies.toLowerCase().includes("nut")
      },
      image: menuFormImage
    };

    try {
      await setDocWrapper(doc(db, "menu_items", finalId), itemData);
      setIsMenuFormOpen(false);
      if (onSettingsUpdate) onSettingsUpdate();
    } catch (e) {
      alert("Error saving menu curation, check safety permissions.");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this culinary compilation?")) {
      try {
        await deleteDocWrapper(doc(db, "menu_items", id));
        if (onSettingsUpdate) onSettingsUpdate();
      } catch (e) {
        alert("Egress blocked by Firestore rules.");
      }
    }
  };

  // 2. Staff Profiles & RBAC assignments
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [staffFormName, setStaffFormName] = useState("");
  const [staffFormEmail, setStaffFormEmail] = useState("");
  const [staffFormRole, setStaffFormRole] = useState<AdminRole>("Reservation Staff");

  const handleSaveStaff = async () => {
    if (!staffFormName.trim() || !staffFormEmail.trim()) return;
    const cleanEmail = staffFormEmail.trim().toLowerCase();

    // Use placeholder key. When the staff logs in, they get matched via their active email
    const staffId = "staff_" + Date.now();
    const newStaff = {
      id: staffId,
      name: staffFormName,
      email: cleanEmail,
      role: staffFormRole,
      status: "Active",
      addedAt: new Date().toISOString()
    };

    try {
      await setDocWrapper(doc(db, "users", staffId), newStaff);
      setIsStaffFormOpen(false);
      setStaffFormName("");
      setStaffFormEmail("");
    } catch (e) {
      alert("Error saving staff credential document.");
    }
  };

  const handleToggleStaffStatus = async (userObj: AdminUser) => {
    if (userObj.email === "officialdananj@gmail.com" || userObj.email === "officialdiodan@gmail.com") {
      alert("Sovereign Super Admin profile status cannot be altered.");
      return;
    }
    const newStatus = userObj.status === "Active" ? "Suspended" : "Active";
    try {
      await updateDocWrapper(doc(db, "users", userObj.id), { status: newStatus });
    } catch (e) {
      alert("Modification restricted.");
    }
  };

  const handleDeleteStaff = async (id: string, email: string) => {
    if (email === "officialdananj@gmail.com" || email === "officialdiodan@gmail.com") {
      alert("Sovereign Super Admin cannot be evicted.");
      return;
    }
    if (window.confirm("Evict this staff member from database and block credentials?")) {
      try {
        await deleteDocWrapper(doc(db, "users", id));
      } catch (e) {
        alert("Action restricted.");
      }
    }
  };

  // 3. Testimonial Reviews CRUD
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);
  const [reviewFormName, setReviewFormName] = useState("");
  const [reviewFormRole, setReviewFormRole] = useState("");
  const [reviewFormComment, setReviewFormComment] = useState("");

  const handleSaveTestimonial = async () => {
    if (!reviewFormName.trim() || !reviewFormComment.trim()) return;
    const docId = "review_" + Date.now();
    const reviewObj: Testimonial = {
      name: reviewFormName,
      role: reviewFormRole || "Patron of Ona",
      comment: reviewFormComment,
      rating: 5
    };

    try {
      await setDocWrapper(doc(db, "testimonials", docId), reviewObj);
      setIsTestimonialFormOpen(false);
      setReviewFormName("");
      setReviewFormRole("");
      setReviewFormComment("");
    } catch (e) {
      alert("Error saving review projection.");
    }
  };

  const handleDeleteTestimonial = async (name: string) => {
    if (window.confirm("Are you sure you want to delete this review project?")) {
      const docId = name.replace(/[^a-zA-Z0-9]/g, "_");
      try {
        await deleteDocWrapper(doc(db, "testimonials", docId));
      } catch (e) {
        // Try searching by name match manually
        const snap = await getDocs(collection(db, "testimonials"));
        snap.forEach(async (d) => {
          if (d.data().name === name) {
            await deleteDocWrapper(doc(db, "testimonials", d.id));
          }
        });
      }
    }
  };

  // 4. Update Reservations and inquiries state
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await updateDocWrapper(doc(db, "reservations", id), { status: newStatus });
    } catch (e) {
      // Create if it was fallback
      const found = reservations.find(r => r.id === id);
      if (found) {
        await setDocWrapper(doc(db, "reservations", id), { ...found, status: newStatus });
      }
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      await updateDocWrapper(doc(db, "event_enquiries", id), { status: newStatus });
    } catch (e) {
      // Find within fallback arrays
      const foundPriv = privateDining.find(p => p.id === id);
      if (foundPriv) {
        await setDocWrapper(doc(db, "event_enquiries", id), {
          id: foundPriv.id,
          name: foundPriv.name,
          email: foundPriv.email,
          phone: foundPriv.phone,
          date: foundPriv.date,
          guests: foundPriv.guests,
          type: foundPriv.type,
          status: newStatus,
          details: foundPriv.details
        });
      }
    }
  };

  const handleGlobalSettingsSave = async () => {
    try {
      await setDocWrapper(doc(db, "admin_settings", "operational"), appSettings);
      alert("Operational parameters customized securely.");
    } catch (e) {
      alert("Failed to modify operational settings.");
    }
  };

  const handleExportReservations = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reservations, null, 2));
    const shadowAnchor = document.createElement("a");
    shadowAnchor.setAttribute("href", dataStr);
    shadowAnchor.setAttribute("download", "ona_reservations_audit.json");
    document.body.appendChild(shadowAnchor);
    shadowAnchor.click();
    shadowAnchor.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3E301F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg tracking-widest text-[#3E301F] font-light">VALET GATE LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3E301F] py-28 md:py-32 px-4 md:px-12 flex flex-col justify-start">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        
        {/* TOP BAR HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#CBBDA9]/40 gap-4 mb-8">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#8C6D4F] font-semibold block">COOP SYSTEM PORTAL</span>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-[#3E301F] tracking-wide">
              Ona Lagos Administration
            </h1>
          </div>
          {currentUser && (
            <div className="flex items-center gap-4 bg-[#ECE5D8] border border-[#CBBDA9]/40 p-3 pr-4 rounded-none shadow-sm">
              <div className="text-right">
                <p className="font-sans text-xs font-semibold text-[#3E301F] leading-none">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest border ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 border border-[#CBBDA9]/40 hover:bg-[#FAF6F0] text-[#3E301F] cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SIGN IN VIEW - FIREBASE GATED */}
        {!currentUser ? (
          <div className="flex-grow flex items-center justify-center py-10 md:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-[#ECE5D8] border border-[#CBBDA9] p-8 shadow-[0_10px_40px_rgba(74,53,24,0.06)] space-y-8 text-center"
            >
              <div className="space-y-2">
                <div className="inline-flex p-3 rounded-full bg-[#FAF6F0] text-[#3E301F] border border-[#CBBDA9]/40 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest uppercase">CONCIERGE PORTAL</h2>
                <p className="font-sans text-xs text-[#8C6D4F] tracking-wide">Login details to access Ona Lagos dashboard.</p>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-xs py-3 px-4 flex items-start gap-2 rounded-none text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="font-sans text-[10px] uppercase tracking-widest text-[#3E301F] font-bold block">Authorized Email</label>
                  <input
                    id="admin-email"
                    required
                    type="email"
                    placeholder="officialdananj@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#CBBDA9] px-4 py-3 text-sm text-[#3E301F] focus:outline-none focus:border-[#3E301F] rounded-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="admin-pass" className="font-sans text-[10px] uppercase tracking-widest text-[#3E301F] font-bold block">Password</label>
                  <input
                    id="admin-pass"
                    required
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#CBBDA9] px-4 py-3 text-sm text-[#3E301F] focus:outline-none focus:border-[#3E301F] rounded-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginSuccess}
                  className="w-full cursor-pointer bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] font-sans text-xs uppercase tracking-widest font-semibold py-3.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  {loginSuccess ? "Verifying..." : "Gain Entry"}
                </button>
              </form>

              {/* Development details */}
              <div className="bg-[#FAF6F0]/60 p-4 border border-[#CBBDA9]/30 text-left space-y-2 rounded-none">
                <p className="font-sans text-[10px] uppercase font-bold text-[#3E301F] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>ADMIN ACCESS COMPILATION</span>
                </p>
                <p className="font-sans text-xs text-[#8C6D4F] leading-relaxed">
                  Log in with your administrator email. Use the website footer "Staff Portal" to trigger signup if you haven't configured an account password.
                </p>
                <button
                  onClick={() => { setLoginEmail("officialdananj@gmail.com"); setLoginPassword("password123"); }}
                  className="w-full block text-left font-mono text-[11px] text-amber-800 hover:underline hover:text-amber-950 font-bold bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 cursor-pointer"
                >
                  officialdananj@gmail.com (Demo fill)
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* AUDITING WORKSPACE */
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COMPREHENSIVE LUXURY SIDEBAR NAVIGATION */}
            <div className="lg:col-span-3 bg-[#FCFAF5] border border-[#CBBDA9] p-5 space-y-6">
              <div className="border-b border-[#CBBDA9]/40 pb-4">
                <span className="font-serif text-[10px] tracking-widest text-[#8C6D4F] uppercase">Navigation Index</span>
                <p className="font-sans text-xs text-[#3E301F] font-light mt-1">Select an entity list to update.</p>
              </div>

              <div className="flex flex-col space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3, roles: ["Super Admin", "Manager", "Content Editor", "Reservation Staff"] },
                  { id: "ona-lifestyle", label: "Ona Lifestyle", icon: ShoppingBag, roles: ["Super Admin", "Admin", "Manager", "Content Editor", "Reservation Staff"] },
                  { id: "content-manager", label: "Content Manager", icon: Database, roles: ["Super Admin", "Manager", "Content Editor", "Admin"] },
                  { id: "reservations", label: "Reservations", icon: CalendarDays, roles: ["Super Admin", "Manager", "Reservation Staff"] },
                  { id: "menu", label: "Menu Catalog", icon: UtensilsCrossed, roles: ["Super Admin", "Manager", "Content Editor"] },
                  { id: "kids-menu", label: "Kids Menu", icon: Baby, roles: ["Super Admin", "Manager", "Content Editor"] },
                  { id: "dietary", label: "Dietary Settings", icon: Sliders, roles: ["Super Admin", "Manager", "Content Editor"] },
                  { id: "private-dining", label: "Private Dining", icon: Building, roles: ["Super Admin", "Manager", "Reservation Staff"] },
                  { id: "shoots", label: "Event / Film Shoots", icon: Camera, roles: ["Super Admin", "Manager", "Reservation Staff"] },
                  { id: "testimonials", label: "Testimonials", icon: Award, roles: ["Super Admin", "Manager", "Content Editor"] },
                  { id: "messages", label: "Contact Inbox", icon: Mail, roles: ["Super Admin", "Manager", "Reservation Staff"] },
                  { id: "staff", label: "Staff & Role RBAC", icon: Users, roles: ["Super Admin"] },
                  { id: "website-customization", label: "Website Customization", icon: Palette, roles: ["Super Admin", "Admin"] },
                  { id: "settings", label: "Website Settings", icon: Settings, roles: ["Super Admin"] }
                ].map(nav => {
                  const allowed = nav.roles.includes(currentUser.role);
                  const isCurActive = activePanel === nav.id;
                  
                  return (
                    <button
                      key={nav.id}
                      disabled={!allowed}
                      onClick={() => setActivePanel(nav.id)}
                      className={`w-full text-left font-sans text-xs uppercase tracking-[0.15em] py-3.5 px-4 flex items-center justify-between transition-colors border-l-2 focus:outline-none relative cursor-pointer ${
                        !allowed
                          ? "opacity-35 cursor-not-allowed bg-transparent text-gray-400 border-transparent"
                          : isCurActive
                          ? "bg-[#ECE5D8] text-[#3E301F] border-[#3E301F] font-semibold"
                          : "bg-transparent text-[#8C6D4F] border-transparent hover:bg-[#FAF6F0] hover:border-[#CBBDA9]/20"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <nav.icon className="w-4 h-4 shrink-0" />
                        <span>{nav.label}</span>
                      </span>
                      {!allowed && (
                        <Lock className="w-3 h-3 text-[#8C6D4F]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {onCloseAdmin && (
                <button
                  onClick={onCloseAdmin}
                  className="w-full py-3 border border-[#3E301F] hover:bg-[#3E301F] hover:text-[#F4EFE6] text-[#3E301F] text-xs font-sans uppercase tracking-widest font-medium transition-colors cursor-pointer"
                >
                  Return to Website
                </button>
              )}
            </div>

            {/* HIGH FIDELITY RENDER WORKSPACE */}
            <div className="lg:col-span-9 bg-[#FCFAF5] border border-[#CBBDA9] p-6 md:p-8 space-y-8 min-h-[600px] flex flex-col justify-between">
              
              {/* PANEL 1: ANALYTICS OVERVIEW */}
              {activePanel === "overview" && (
                <div className="space-y-8">
                  <div className="border-b border-[#CBBDA9]/40 pb-4">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">REAL-TIME DESK AUDIT</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Live cloud operations monitoring for Ona Lagos (Victoria Island).</p>
                  </div>

                  {/* HIGH-END KEY METRICS BOARD */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Bookings", val: reservations.length, extra: "Tonight: 2 VIPs" },
                      { label: "Pending Enquiries", val: reservations.filter(r => r.status === "Pending").length + privateDining.filter(p => p.status === "Pending").length, extra: "Requires callbacks" },
                      { label: "Private Dining", val: privateDining.length, extra: "Confirmed list" },
                      { label: "Film Shoots", val: movieShoots.length, extra: "Approved slots" },
                      { label: "Menu Curations", val: menuItems.length, extra: "12 live sections" },
                      { label: "Visual Gallery", val: galleryItems.length, extra: "High contrast captures" },
                      { label: "Staff Mapped", val: admins.length, extra: "RBAC active profiles" },
                      { label: "Direct Inquiries", val: messages.length, extra: "Unread queries" }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 space-y-1 hover:border-[#CBBDA9] transition-colors">
                        <span className="font-sans text-[10px] text-[#8C6D4F] uppercase tracking-wider block">{card.label}</span>
                        <p className="font-serif text-3xl font-light text-[#3E301F]">{card.val}</p>
                        <span className="font-sans text-[9px] text-[#3E301F]/70 block italic">{card.extra}</span>
                      </div>
                    ))}
                  </div>

                  {/* CHARTS */}
                  <div className="bg-[#FAF6F0] border border-[#CBBDA9]/45 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-light text-[#3E301F]">Weekly Curations Volume</h3>
                        <p className="font-sans text-[11px] text-[#8C6D4F]">Active sitting volume curves across weekdays.</p>
                      </div>
                      <span className="font-mono text-[10px] bg-[#ECE5D8] text-[#3E301F] px-3 py-1 border border-[#CBBDA9]/40">LIVE CLOUD METRIC</span>
                    </div>

                    <div className="h-44 w-full flex items-end relative">
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8C6D4F" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 140 L 0 50 Q 150 110 300 30 T 600 90 T 900 60 T 1200 140 Z"
                          fill="url(#chart-glow)"
                          className="w-full"
                        />
                        <path
                          d="M 0 50 Q 150 110 300 30 T 600 90 T 900 60 T 1200 60"
                          fill="none"
                          stroke="#8C6D4F"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-x-0 bottom-[-20px] flex justify-between font-mono text-[9px] text-[#8C6D4F]">
                        <span>TUESDAYS</span>
                        <span>THURSDAYS</span>
                        <span>SATURDAYS</span>
                        <span>SUNDAY BRUNCH</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 2: RESERVATIONS AUDITING */}
              {activePanel === "reservations" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CBBDA9]/40 pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">PATRON RESERVATIONS</h2>
                      <p className="font-sans text-xs text-[#8C6D4F] mt-1">Audit and confirm seat listings dynamically.</p>
                    </div>
                    <button
                      onClick={handleExportReservations}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#3E301F] hover:bg-[#FAF6F0] text-xs font-sans font-medium uppercase tracking-wider cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Seating Ledger</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CBBDA9]/60 text-[#8C6D4F] uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-2">Patron Details</th>
                          <th className="py-3 px-2">Schedule Date / Time</th>
                          <th className="py-3 px-2 text-center">Guests</th>
                          <th className="py-3 px-2">Type</th>
                          <th className="py-3 px-2">Current Status</th>
                          <th className="py-3 px-4 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBBDA9]/20">
                        {reservations.map(res => (
                          <tr key={res.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="py-3.5 px-2">
                              <p className="font-medium text-[#3E301F]">{res.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{res.email} • {res.phone}</p>
                            </td>
                            <td className="py-3.5 px-2 font-mono">{res.date} • {res.time}</td>
                            <td className="py-3.5 px-2 text-center font-semibold text-stone-850">{res.guests}</td>
                            <td className="py-3.5 px-2 font-light">{res.type}</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                                res.status === "Confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" :
                                res.status === "Pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-800" :
                                "bg-gray-100 text-gray-500"
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              {res.status === "Pending" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(res.id, "Confirmed")}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-semibold uppercase tracking-wider text-[9px] cursor-pointer"
                                >
                                  Confirm
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateBookingStatus(res.id, "Cancelled")}
                                className="px-2 py-1 border border-red-500/30 text-red-600 hover:bg-red-500/10 uppercase font-sans text-[9px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL 3: MENU CATALOG */}
              {activePanel === "menu" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CBBDA9]/40 pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">MENU CATALOG MANAGEMENT</h2>
                      <p className="font-sans text-xs text-[#8C6D4F] mt-1">Publish, update, or edit fine dining menu options.</p>
                    </div>
                    {hasAccess(["Super Admin", "Manager"]) && (
                      <button
                        onClick={handleOpenAddMenu}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] text-xs font-sans font-medium uppercase tracking-wider cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Recipe</span>
                      </button>
                    )}
                  </div>

                  {/* FORM OVERLAY */}
                  {isMenuFormOpen && (
                    <div className="bg-[#FAF6F0] border-2 border-[#CBBDA9] p-6 space-y-4">
                      <h3 className="font-serif text-lg text-[#3E301F]">
                        {editingMenuItem ? `Edit Selection: ${editingMenuItem.name}` : "Create New Culinary Compilation"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Recipe Name</label>
                          <input
                            type="text"
                            value={menuFormName}
                            onChange={(e) => setMenuFormName(e.target.value)}
                            placeholder="e.g. Smoky Suya Skewers"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Price tag</label>
                          <input
                            type="text"
                            value={menuFormPrice}
                            onChange={(e) => setMenuFormPrice(e.target.value)}
                            placeholder="₦15,000"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Gourmet Narration / Description</label>
                          <textarea
                            rows={2}
                            value={menuFormDesc}
                            onChange={(e) => setMenuFormDesc(e.target.value)}
                            placeholder="Narrate ingredients and slow-fire cooking rhythm..."
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Image url</label>
                          <input
                            type="text"
                            value={menuFormImage}
                            onChange={(e) => setMenuFormImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none text-[10px]"
                          />
                        </div>

                        {/* Dietary settings */}
                        <div className="space-y-2 md:col-span-2 border-t border-[#CBBDA9]/30 pt-3">
                          <label className="text-[10px] tracking-widest uppercase font-bold block text-stone-700 mb-2">Dietary Alignments</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={menuFormIsVeh} onChange={() => setMenuFormIsVeh(!menuFormIsVeh)} />
                              <span>Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={menuFormIsVeg} onChange={() => setMenuFormIsVeg(!menuFormIsVeg)} />
                              <span>Vegan</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={menuFormIsGF} onChange={() => setMenuFormIsGF(!menuFormIsGF)} />
                              <span>Gluten Free</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={menuFormIsSpicy} onChange={() => setMenuFormIsSpicy(!menuFormIsSpicy)} />
                              <span>Spicy Rub</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                              <input type="checkbox" checked={menuFormIsKids} onChange={() => setMenuFormIsKids(!menuFormIsKids)} />
                              <span>Kids Friendly / Mild Selection</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => setIsMenuFormOpen(false)}
                          className="px-4 py-2 border border-[#3E301F] text-xs font-sans uppercase tracking-wider cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={handleSaveMenuItem}
                          className="px-4 py-2 bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer"
                        >
                          Commit &amp; Publish
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menuItems.map(item => (
                      <div key={item.id} className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 flex gap-3 items-start justify-between">
                        <div className="flex gap-3">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover border border-[#CBBDA9]/20" />
                          <div className="text-left">
                            <h4 className="font-serif text-sm font-semibold text-[#3E301F]">{item.name}</h4>
                            <p className="text-[10px] text-gray-500 font-mono italic leading-relaxed truncate max-w-[200px]">{item.description}</p>
                            <p className="text-xs text-[#8C6D4F] font-semibold mt-1">{item.price}</p>
                          </div>
                        </div>
                        {hasAccess(["Super Admin", "Manager"]) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleOpenEditMenu(item)}
                              className="p-1 px-2 border border-[#CBBDA9] hover:bg-[#ECE5D8] text-[9px] uppercase tracking-wider cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="p-1 px-2 border border-red-500/20 hover:bg-red-500/10 text-red-600 text-[9px] uppercase tracking-wider cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 4: KIDS MENU */}
              {activePanel === "kids-menu" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">KIDS MENU COLLECTIONS</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Gating and publishing mild selections for younger families.</p>
                  </div>

                  <div className="bg-[#FAF6F0] p-5 border border-[#CBBDA9]/30 text-left space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#CBBDA9]/10">
                      <span className="font-sans font-semibold text-xs text-[#3E301F]">Active Kids Listings ({menuItems.filter(m => m.categories.includes("kids") || !!m.dietary?.isKidsFriendly).length})</span>
                      <button
                        onClick={handleOpenAddMenu}
                        className="p-2 bg-[#3E301F] hover:bg-[#4F4130] text-white text-[10px] font-sans uppercase tracking-widest cursor-pointer"
                      >
                        Add Kids Recipe
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {menuItems.filter(m => m.categories.includes("kids") || !!m.dietary?.isKidsFriendly).map(item => (
                        <div key={item.id} className="bg-white p-3 border border-[#CBBDA9]/20 flex justify-between items-start">
                          <div className="text-left">
                            <h4 className="font-serif text-xs font-semibold">{item.name}</h4>
                            <p className="text-[10px] font-mono mt-1 text-gold-600 font-semibold">{item.price}</p>
                          </div>
                          <span className="px-2 py-0.5 border border-[#8C6D4F]/25 text-[#8C6D4F] text-[9px] font-sans uppercase tracking-widest">Active Kids Curation</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 5: DIETARY SETTINGS */}
              {activePanel === "dietary" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">DIETARY RESTRICTIONS LISTS</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Configure global allergen warnings, botanical replacements, and herbs tags.</p>
                  </div>

                  <div className="bg-[#FAF6F0] p-6 border border-[#CBBDA9]/30 text-left space-y-4">
                    <h3 className="font-serif text-base text-[#3E301F]">Allergen Gating Parameters</h3>
                    <p className="font-sans text-xs text-[#8C6D4F] leading-relaxed">
                      Enable warning triggers inside standard guest dining sheets. Our kitchen checks these tags automatically during table placement.
                    </p>
                    <div className="space-y-3 pt-2 text-xs">
                      {[
                        { label: "Tree Nuts & Groundnut allergy advice warning details", active: true },
                        { label: "Gluten-Free wild sorghum dough tags", active: true },
                        { label: "Lactose-Free palm-puree mock sips", active: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#CBBDA9]/20">
                          <span className="font-sans font-light">{item.label}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold border ${item.active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                            {item.active ? "ACTIVE TRIGGER" : "DORMANT"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 6: PRIVATE DINING */}
              {activePanel === "private-dining" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">PRIVATE CELEBRATION ENQUIRIES</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Exclusives board celebratory dinners, anniversaries, and corporate galas.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CBBDA9]/60 text-[#8C6D4F] uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-2">Patron Coordinates</th>
                          <th className="py-3 px-2">Proposed Celebration</th>
                          <th className="py-3 px-2 text-center">Seating size</th>
                          <th className="py-3 px-2 text-left">Application details</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBBDA9]/20">
                        {privateDining.map(enq => (
                          <tr key={enq.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="py-3.5 px-2">
                              <p className="font-medium text-[#3E301F]">{enq.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{enq.email} • {enq.phone}</p>
                            </td>
                            <td className="py-3.5 px-2 font-mono">{enq.date}</td>
                            <td className="py-3.5 px-2 text-center font-bold">{enq.guests}</td>
                            <td className="py-3.5 px-2 truncate max-w-[200px]" title={enq.details}>{enq.details}</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 text-[9px] border ${
                                enq.status === "Confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" :
                                enq.status === "Contacted" ? "bg-blue-500/10 border-blue-500/20 text-blue-800" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-850"
                              }`}>
                                {enq.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right space-x-1 whitespace-nowrap">
                              {enq.status === "Pending" && (
                                <button
                                  onClick={() => handleUpdateEnquiryStatus(enq.id, "Contacted")}
                                  className="px-2 py-1 bg-blue-600 font-semibold text-white uppercase text-[9px] cursor-pointer"
                                >
                                  Contacted
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateEnquiryStatus(enq.id, "Confirmed")}
                                className="px-2 py-1 bg-emerald-600 font-semibold text-white uppercase text-[9px] cursor-pointer"
                              >
                                Confirm
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL 7: MOVIE SHOOTS */}
              {activePanel === "shoots" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">FILM &amp; FASHION SHOOTS</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Ground clearances for fashion editorials, scene filming, and commercials.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CBBDA9]/60 text-[#8C6D4F] uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-2">Producer / Entity</th>
                          <th className="py-3 px-2">Company Name</th>
                          <th className="py-3 px-2">Shoot Details ({activePanel})</th>
                          <th className="py-3 px-2 text-center">Crew Size</th>
                          <th className="py-3 px-2 text-center">Hours</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBBDA9]/20">
                        {movieShoots.map(sho => (
                          <tr key={sho.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="py-3.5 px-2">
                              <p className="font-medium">{sho.producer}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{sho.email}</p>
                            </td>
                            <td className="py-3.5 px-2">{sho.company}</td>
                            <td className="py-3.5 px-2 font-mono text-[10px]">{sho.shootType} • {sho.shootDate}</td>
                            <td className="py-3.5 px-2 text-center font-bold">{sho.crewSize}</td>
                            <td className="py-3.5 px-2 text-center">{sho.durationHours} hrs</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 text-[9px] border ${
                                sho.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-800"
                              }`}>
                                {sho.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={async () => {
                                  try {
                                    await updateDocWrapper(doc(db, "event_enquiries", sho.id), { status: "Approved" });
                                  } catch (e) {
                                    // backup set
                                    await setDocWrapper(doc(db, "event_enquiries", sho.id), {
                                      id: sho.id,
                                      name: sho.producer,
                                      company: sho.company,
                                      phone: sho.phone,
                                      email: sho.email,
                                      date: sho.shootDate,
                                      duration: sho.durationHours,
                                      guests: sho.crewSize,
                                      type: sho.shootType,
                                      status: "Approved",
                                      details: sho.description
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-emerald-600 font-semibold text-white uppercase text-[9px] cursor-pointer"
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL 8: TESTIMONIALS */}
              {activePanel === "testimonials" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CBBDA9]/40 pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">PATRON TESTIMONIALS</h2>
                      <p className="font-sans text-xs text-[#8C6D4F] mt-1">Audit and project verified patron experiences onto the homepage.</p>
                    </div>
                    <button
                      onClick={() => setIsTestimonialFormOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] text-xs font-sans uppercase tracking-widest font-medium cursor-pointer shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add review</span>
                    </button>
                  </div>

                  {isTestimonialFormOpen && (
                    <div className="bg-[#FAF6F0] border-2 border-[#CBBDA9] p-6 space-y-4">
                      <h3 className="font-serif text-base text-[#3E301F]">Add verified review</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Patron Name</label>
                          <input
                            type="text"
                            value={reviewFormName}
                            onChange={(e) => setReviewFormName(e.target.value)}
                            placeholder="e.g. Chief Burna"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Role / Title</label>
                          <input
                            type="text"
                            value={reviewFormRole}
                            onChange={(e) => setReviewFormRole(e.target.value)}
                            placeholder="e.g. Afrobeats Artist"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold text-stone-700">Review / Comments</label>
                          <textarea
                            rows={3}
                            value={reviewFormComment}
                            onChange={(e) => setReviewFormComment(e.target.value)}
                            placeholder="Verified quotation regarding slow-cooking fire or layout..."
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => setIsTestimonialFormOpen(false)} className="px-3 py-1.5 border border-[#3E301F] cursor-pointer font-sans uppercase">Dismiss</button>
                        <button onClick={handleSaveTestimonial} className="px-3 py-1.5 bg-[#3E301F] text-white cursor-pointer font-sans font-semibold uppercase">Commit</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((t, index) => (
                      <div key={index} className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/35 text-left flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <p className="font-sans text-xs italic text-[11px] text-[#3E301F]">"{t.comment}"</p>
                          <div>
                            <p className="font-serif text-xs font-semibold">{t.name}</p>
                            <p className="text-[9px] uppercase tracking-wider text-[#8C6D4F] font-sans">{t.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTestimonial(t.name)}
                          className="text-red-650 hover:text-red-850 p-1 border border-red-500/10 hover:bg-red-500/5 cursor-pointer text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 9: MESSAGES */}
              {activePanel === "messages" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">CONTACT INBOX</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Audit guest comments, feedback lists, or sommelier suggestions.</p>
                  </div>

                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className="bg-[#FAF6F0] p-4 border border-[#CBBDA9]/30 text-left space-y-3">
                        <div className="flex justify-between items-center border-b border-[#CBBDA9]/10 pb-2">
                          <div>
                            <span className="font-serif text-sm font-semibold text-[#3E301F] block">{msg.name}</span>
                            <span className="text-[10px] font-mono text-gray-500 font-sans">{msg.email} • Mapped: {msg.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold border ${msg.status === "Unread" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-gray-50 text-gray-500"}`}>{msg.status}</span>
                        </div>
                        <p className="font-serif text-xs leading-relaxed text-[#3E301F]">
                          <strong className="block font-sans not-italic text-[11px] text-[#8C6D4F] mb-1">Subject: {msg.subject}</strong>
                          "{msg.message}"
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={async () => {
                              try {
                                await updateDocWrapper(doc(db, "contact_messages", msg.id), { status: "Read" });
                              } catch (e) {
                                await setDocWrapper(doc(db, "contact_messages", msg.id), { ...msg, status: "Read" });
                              }
                            }}
                            className="px-2 py-1 border border-[#3E301F] uppercase tracking-widest text-[9px] cursor-pointer"
                          >
                            Mark Read
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 10: STAFF & RBAC ROLES */}
              {activePanel === "staff" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CBBDA9]/40 pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">STAFF &amp; AUTH ROLE ASSIGNMENTS</h2>
                      <p className="font-sans text-xs text-[#8C6D4F] mt-1">Super Admin controller to designate console permission badges.</p>
                    </div>
                    <button
                      onClick={() => setIsStaffFormOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] text-xs font-sans uppercase tracking-widest font-medium cursor-pointer shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Map New Staff Role</span>
                    </button>
                  </div>

                  {isStaffFormOpen && (
                    <div className="bg-[#FAF6F0] border-2 border-[#CBBDA9] p-6 space-y-4">
                      <h3 className="font-serif text-base text-[#3E301F]">Map New Authorized Member</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-stone-700">Staff Full Name</label>
                          <input
                            type="text"
                            value={staffFormName}
                            onChange={(e) => setStaffFormName(e.target.value)}
                            placeholder="e.g. Sommelier Daniel"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-stone-700">Staff Secure Email</label>
                          <input
                            type="email"
                            value={staffFormEmail}
                            onChange={(e) => setStaffFormEmail(e.target.value)}
                            placeholder="sommelier@onalagos.com"
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-stone-700">RBAC Role Privilege</label>
                          <select
                            value={staffFormRole}
                            onChange={(e) => setStaffFormRole(e.target.value as AdminRole)}
                            className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                          >
                            <option value="Manager">Manager</option>
                            <option value="Content Editor">Content Editor</option>
                            <option value="Reservation Staff">Reservation Staff</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => setIsStaffFormOpen(false)} className="px-3 py-1.5 border border-[#3E301F] cursor-pointer uppercase">Discard</button>
                        <button onClick={handleSaveStaff} className="px-3 py-1.5 bg-[#3E301F] text-white cursor-pointer font-semibold uppercase">Commit Mapping</button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CBBDA9]/60 text-[#8C6D4F] uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-2">Authorized Staff Member</th>
                          <th className="py-3 px-2">Assigned Email Address</th>
                          <th className="py-3 px-2 text-center">Badge Role</th>
                          <th className="py-3 px-2 text-center">Active Status</th>
                          <th className="py-3 px-4 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBBDA9]/20">
                        {admins.map(adm => (
                          <tr key={adm.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="py-3.5 px-2 font-semibold text-[#3E301F]">{adm.name}</td>
                            <td className="py-3.5 px-2 font-mono text-[#8C6D4F]">{adm.email}</td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`px-2 py-0.5 border text-[9px] ${getRoleBadgeColor(adm.role)}`}>
                                {adm.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`px-2.5 py-0.5 font-bold border ${adm.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                {adm.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleStaffStatus(adm)}
                                className="px-2.5 py-1 border border-[#CBBDA9] uppercase text-[9px] hover:bg-gray-100 cursor-pointer"
                              >
                                {adm.status === "Active" ? "Suspend" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(adm.id, adm.email)}
                                className="px-2.5 py-1 text-red-650 hover:bg-red-500/10 uppercase text-[9px] border border-red-500/10 cursor-pointer"
                              >
                                Evict
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL 11: SETTINGS */}
              {activePanel === "settings" && (
                <div className="space-y-6">
                  <div className="border-b border-[#CBBDA9]/40 pb-4 text-left">
                    <h2 className="font-serif text-2xl font-normal text-[#3E301F] tracking-widest">GLOBAL OPERATIONAL SETTINGS</h2>
                    <p className="font-sans text-xs text-[#8C6D4F] mt-1">Configure coordination numbers, active links, and hero displays.</p>
                  </div>

                  <div className="bg-[#FAF6F0] p-6 border border-[#CBBDA9]/30 text-left space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-700">Reservation App Link Setting (*)</label>
                        <input
                          type="text"
                          value={appSettings.reservationAppLink}
                          onChange={(e) => setAppSettings({ ...appSettings, reservationAppLink: e.target.value })}
                          className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-700">WhatsApp Dispatch Link</label>
                        <input
                          type="text"
                          value={appSettings.whatsappNumber}
                          onChange={(e) => setAppSettings({ ...appSettings, whatsappNumber: e.target.value })}
                          className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-700">Concierge Desk Voice</label>
                        <input
                          type="text"
                          value={appSettings.phoneNumber}
                          onChange={(e) => setAppSettings({ ...appSettings, phoneNumber: e.target.value })}
                          className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-700">Concierge Primary Mail</label>
                        <input
                          type="text"
                          value={appSettings.emailAddress}
                          onChange={(e) => setAppSettings({ ...appSettings, emailAddress: e.target.value })}
                          className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-stone-700">Physical Address coordinates</label>
                        <input
                          type="text"
                          value={appSettings.physicalAddress}
                          onChange={(e) => setAppSettings({ ...appSettings, physicalAddress: e.target.value })}
                          className="w-full bg-white border border-[#CBBDA9] p-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleGlobalSettingsSave}
                        className="px-5 py-2.5 bg-[#3E301F] hover:bg-[#4F4130] text-[#FAF6F0] text-xs font-sans uppercase tracking-widest font-semibold cursor-pointer shadow"
                      >
                        Commit System Parameters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 12: WEBSITE CUSTOMIZATION / CMS */}
              {activePanel === "website-customization" && (
                <WebsiteCustomizer currentUser={currentUser} />
              )}

              {/* PANEL 14: ONA LIFESTYLE PRODUCT MANAGER */}
              {activePanel === "ona-lifestyle" && (
                <OnaLifestyleManager currentUser={currentUser} />
              )}

              {/* PANEL 13: CONTENT MANAGER */}
              {activePanel === "content-manager" && (
                <ContentManager currentUser={currentUser} />
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
