import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { OnaLifestyleProduct } from "../types";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


// Seed data if database is empty or unavailable
export const DEFAULT_LIFESTYLE_PRODUCTS: OnaLifestyleProduct[] = [
  {
    id: "lf_1",
    name: "Ona Signature Scented Candle",
    slug: "ona-signature-scented-candle",
    category: "Home & Lifestyle",
    description: "An ambient aromatherapy profile consisting of alligator pepper, dried sweet orange peel, and warm smoked vetiver. Hand-poured in Victoria Island into bespoke, raw black mud earthenware jars.",
    imageUrl: "https://images.unsplash.com/photo-1603006905393-0d4133464e83?w=800&auto=format&fit=crop&q=80",
    price: 35000,
    discountPrice: null,
    stockStatus: "In Stock",
    quantityAvailable: 45,
    featured: true,
    publishStatus: "Published",
    displayOrder: 1,
    tags: ["Premium", "Gift", "Ona Exclusive", "New Arrival"],
    ctaType: "Order via WhatsApp",
    ctaLink: "https://wa.me/234900000000",
    seoTitle: "Ona Signature Scented Candle | Ona Lagos Store",
    seoDescription: "Exquisite alligator pepper and vetiver hand-poured candle in mud-baked ceramic jar.",
    createdAt: new Date("2026-05-10T12:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-10T12:00:00Z").toISOString()
  },
  {
    id: "lf_2",
    name: "Lagos Mahogany Carving & Roast Board",
    slug: "lagos-mahogany-carving-roast-board",
    category: "Limited Edition",
    description: "Individually hand-sculpted West African mahogany serving platter, raw-edged with polished brass structural inlays. Designed to present the signature Sunday Roast pieces with absolute theatrical grandeur.",
    imageUrl: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80",
    price: 120000,
    discountPrice: 95000,
    stockStatus: "Low Stock",
    quantityAvailable: 8,
    featured: true,
    publishStatus: "Published",
    displayOrder: 2,
    tags: ["Premium", "Limited", "Ona Exclusive"],
    ctaType: "Order via WhatsApp",
    ctaLink: "https://wa.me/234900000000",
    seoTitle: "Limited Edition Lagos Mahogany Sharing Platter",
    seoDescription: "Forged West African hardwood serving board used for Ona Lagos Sunday feast curations.",
    createdAt: new Date("2026-05-12T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-12T10:00:00Z").toISOString()
  },
  {
    id: "lf_3",
    name: "The Ona Charcoal Organic Linen Apron",
    slug: "the-ona-charcoal-organic-linen-apron",
    category: "Merchandise",
    description: "Specially tailored linen chef apron dyed using artisanal sub-Saharan mineral charcoal salts. Featuring elegant golden cross-back strap bindings and a hand-stitched layout chart of West African crop lines.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80",
    price: 45000,
    discountPrice: null,
    stockStatus: "In Stock",
    quantityAvailable: 20,
    featured: false,
    publishStatus: "Published",
    displayOrder: 3,
    tags: ["Premium", "Gift", "New Arrival"],
    ctaType: "Enquire Now",
    ctaLink: "",
    seoTitle: "Artisanal Charcoal Linen Chef Apron - Ona Lagos",
    seoDescription: "Exquisite kitchen uniform crafted with local organic fibers and custom gold thread accents.",
    createdAt: new Date("2026-05-15T15:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-15T15:00:00Z").toISOString()
  },
  {
    id: "lf_4",
    name: "Geometric Earth-Weave Dinner Plates (Pair)",
    slug: "geometric-earth-weave-dinner-plates-pair",
    category: "Home & Lifestyle",
    description: "Bespoke fine-china dinner plates, presenting custom hand-drawn concentric geometric patterns inspired by Edo artistic legacy. Matte obsidian finish with glossy gold trim highlights.",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80",
    price: 58000,
    discountPrice: null,
    stockStatus: "Preorder",
    quantityAvailable: 15,
    featured: false,
    publishStatus: "Published",
    displayOrder: 4,
    tags: ["Limited", "Gift", "Ona Exclusive"],
    ctaType: "Enquire Now",
    ctaLink: "",
    seoTitle: "Geometric Matte Obsidian Plate Pair - Ona Lagos",
    seoDescription: "Artistic ceramic plates designed by local sculptors to frame your culinary assemblies.",
    createdAt: new Date("2026-05-18T09:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-18T09:00:00Z").toISOString()
  }
];

interface OnaLifestyleViewProps {
  onOpenReservation?: () => void;
  cms?: any;
}

export default function OnaLifestyleView({ onOpenReservation, cms }: OnaLifestyleViewProps) {
  const [products, setProducts] = useState<OnaLifestyleProduct[]>(() => {
    // Initial loading from localStorage (shared between admin and frontend)
    const local = localStorage.getItem("ona_lifestyle_products");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return DEFAULT_LIFESTYLE_PRODUCTS;
      }
    }
    return DEFAULT_LIFESTYLE_PRODUCTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<OnaLifestyleProduct | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const convexProducts = useQuery(api.lifestyle.getProducts);

  // Sync with Convex
  useEffect(() => {
    if (convexProducts && convexProducts.success && convexProducts.data) {
      const mapped: OnaLifestyleProduct[] = convexProducts.data.map((p: any) => ({
        ...p,
        id: p._id // Ensure compatibility with existing components using .id
      }));
      setProducts(mapped);
      localStorage.setItem("ona_lifestyle_products", JSON.stringify(mapped));
    }
  }, [convexProducts]);

  // Sync state if localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const local = localStorage.getItem("ona_lifestyle_products");
      if (local) {
        try {
          setProducts(JSON.parse(local));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ona_lifestyle_products_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ona_lifestyle_products_changed", handleStorageChange);
    };
  }, []);

  // Filter only published items
  const publishedProducts = products.filter(p => p.publishStatus === "Published");

  // Category list
  const categories = ["All", "Merchandise", "Food Product", "Drink Product", "Gift Item", "Home & Lifestyle", "Limited Edition", "Other"];

  // Filter products by selected category
  const filteredProducts = selectedCategory === "All"
    ? publishedProducts
    : publishedProducts.filter(p => p.category === selectedCategory);

  // Featured Products
  const featuredProducts = publishedProducts.filter(p => p.featured);

  // Currency Formatter
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("NGN", "₦");
  };

  // Stock Badge Render helper
  const renderStockBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-sm">
            <CheckCircle className="w-3 h-3" /> In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-1 rounded-sm">
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </span>
        );
      case "Out Of Stock":
      case "Out of Stock":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-500/10 px-2 py-1 rounded-sm">
            <XCircle className="w-3 h-3" /> Out of Stock
          </span>
        );
      case "Preorder":
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-gold-300 bg-gold-400/10 px-2 py-1 rounded-sm">
            <Clock className="w-3 h-3" /> Preorder
          </span>
        );
      default:
        return null;
    }
  };

  // Click handler for Calls to Action
  const handleCtaClick = (product: OnaLifestyleProduct, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal trigger if clicking on button in grid card
    
    switch (product.ctaType) {
      case "Order via WhatsApp":
        const message = encodeURIComponent(`Hello Ona Lagos, I would like to order "${product.name}". Is it available?`);
        const phone = product.ctaLink || "https://wa.me/234900000000";
        const finalUrl = phone.includes("wa.me") ? `${phone}${phone.includes("?") ? "&" : "?"}text=${message}` : phone;
        window.open(finalUrl, "_blank");
        break;
      case "Enquire Now":
        // Scroll to contact or trigger a standard email layout
        const element = document.getElementById("master-custom-footer") || document.getElementById("contact");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = `mailto:reservations@onalagos.com?subject=${encodeURIComponent(`Ona Lifestyle Enquiry: ${product.name}`)}`;
        }
        break;
      case "Coming Soon":
        // Does nothing, button disabled
        break;
      case "View Details":
        setSelectedProduct(product);
        setActiveGalleryIndex(0);
        break;
    }
  };

  return (
    <div id="ona-lifestyle-page-wrapper" className="min-h-screen bg-[#FAF6F0] text-[#3E301F] font-sans pt-28 pb-20">
      
      {/* 1. LUXURY HERO BANNER SECTION */}
      <section className="relative overflow-hidden mb-16 py-12 md:py-20 bg-gradient-to-b from-[#FAF6F0] via-[#F4EFE6] to-[#FAF6F0] border-y border-gold-400/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold-300/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="font-serif text-sm italic tracking-widest text-[#8C6D4F] block">The Art of Living</span>
            <h1 className="font-serif text-4xl sm:text-6xl font-light tracking-wide text-[#4A3518] leading-tight">
              Ona Lifestyle
            </h1>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#8C6D4F] mt-2 mb-4 block">
              Bespoke Curated Memorabilia
            </p>
            <div className="w-16 h-[1px] bg-gold-400 mx-auto my-6" />
            <p className="font-sans text-sm md:text-base max-w-2xl mx-auto text-gray-600 font-light leading-relaxed">
              Curated lifestyle pieces inspired by the Ona experience. Bringing the true aesthetic of sub-Saharan luxury hospitality into your domestic spaces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED SPOTLIGHT SECTION */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-4 h-4 text-gold-300 shrink-0" />
            <h2 className="font-serif text-xs uppercase tracking-[0.25em] text-[#4A3518] font-bold">
              Featured Spotlights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {featuredProducts.slice(0, 2).map((prod) => (
              <motion.div
                key={`featured-${prod.id}`}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                onClick={() => { setSelectedProduct(prod); setActiveGalleryIndex(0); }}
                className="bg-[#FCFAF7] border border-gold-400/10 hover:border-gold-400/30 overflow-hidden cursor-pointer flex flex-col sm:flex-row group transition-all duration-300"
              >
                {/* Image Section */}
                <div className="sm:w-1/2 relative bg-neutral-100 overflow-hidden h-64 sm:h-auto min-h-[250px]">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#12110E] text-gold-300 font-sans text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 font-semibold rounded-none">
                    Spotlight Award
                  </div>
                </div>

                {/* Content Section */}
                <div className="sm:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] text-[#8C6D4F] uppercase tracking-widest font-mono block">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl text-[#3E301F] font-light group-hover:text-gold-300 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gold-400/10">
                    <div className="flex items-baseline gap-3">
                      {prod.discountPrice ? (
                        <>
                          <span className="text-base text-[#8C6D4F] font-serif font-semibold">
                            {formatNaira(prod.discountPrice)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatNaira(prod.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base text-[#3E301F] font-serif">
                          {formatNaira(prod.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {renderStockBadge(prod.stockStatus)}
                      <button
                        onClick={(e) => handleCtaClick(prod, e)}
                        disabled={prod.ctaType === "Coming Soon"}
                        className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 py-1 border-b cursor-pointer hover:text-gold-300 hover:border-gold-300 transition-all ${
                          prod.ctaType === "Coming Soon" ? "opacity-40 cursor-not-allowed border-transparent text-gray-400" : "border-[#4A3518] text-[#4A3518]"
                        }`}
                      >
                        {prod.ctaType === "Order via WhatsApp" && "WhatsApp order"}
                        {prod.ctaType === "Enquire Now" && "Acquire item"}
                        {prod.ctaType === "Coming Soon" && "Coming Soon"}
                        {prod.ctaType === "View Details" && "Review details"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORY FILTER SELECTOR BAR */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-10 overflow-x-auto">
        <div className="flex justify-center md:items-center space-x-2 md:space-x-4 border-b border-gold-400/15 pb-4 min-w-[max-content] mx-auto">
          {categories.map((cat) => (
            <button
              key={`filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer px-4 py-2 font-sans text-[11px] uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                selectedCategory === cat
                  ? "bg-[#3E301F] text-white font-semibold rounded-none"
                  : "bg-transparent text-gray-500 hover:text-[#3E301F]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 4. PRODUCT GRID VIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 min-h-[300px]">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gold-400/20 bg-[#FCFAF7]">
            <ShoppingBag className="w-12 h-12 text-[#8C6D4F]/40 mx-auto mb-4" />
            <p className="font-serif text-lg text-[#3E301F] font-light">No products mapped</p>
            <p className="text-xs text-gray-400 font-sans mt-1">Please configure lifestyle items via the admin suite.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((prod) => (
                <motion.div
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => { setSelectedProduct(prod); setActiveGalleryIndex(0); }}
                  onMouseEnter={() => setHoveredProductId(prod.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  className="bg-[#FCFAF7] border border-gold-400/10 hover:border-gold-400/35 flex flex-col justify-between group cursor-pointer transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img
                      src={
                        hoveredProductId === prod.id && prod.galleryImages && prod.galleryImages.length > 0
                          ? prod.galleryImages[0]
                          : prod.imageUrl
                      }
                      alt={prod.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="bg-[#12110E]/80 backdrop-blur-md text-[9px] uppercase tracking-widest text-[#F4EFE6] px-2 py-0.5 rounded-none font-mono">
                        {prod.category}
                      </span>
                    </div>

                    {/* Stock Status Bottom Overlay */}
                    <div className="absolute bottom-3 right-3">
                      {renderStockBadge(prod.stockStatus)}
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif text-base text-[#4A3518] tracking-normal font-light group-hover:text-gold-300 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gold-400/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        {prod.discountPrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-serif font-bold text-[#8C6D4F]">
                              {formatNaira(prod.discountPrice)}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatNaira(prod.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-serif text-[#3E301F]">
                            {formatNaira(prod.price)}
                          </span>
                        )}
                        {prod.quantityAvailable !== null && (
                          <span className="text-[9px] text-gray-400 font-mono mt-0.5">
                            Qty: {prod.quantityAvailable} units
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleCtaClick(prod, e)}
                        disabled={prod.ctaType === "Coming Soon"}
                        className={`text-[9px] uppercase font-bold tracking-widest cursor-pointer px-3 py-1.5 transition-all text-xs font-semibold ${
                          prod.ctaType === "Coming Soon"
                            ? "bg-transparent text-gray-400 cursor-not-allowed border-transparent"
                            : "bg-[#4A3518] hover:bg-gold-500 text-[#FAF6F0] hover:text-[#12110E] tracking-widest font-sans font-bold shadow-sm"
                        }`}
                      >
                        {prod.ctaType === "Order via WhatsApp" && "Order"}
                        {prod.ctaType === "Enquire Now" && "Acquire"}
                        {prod.ctaType === "Coming Soon" && "Soon"}
                        {prod.ctaType === "View Details" && "Details"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 5. PRODUCT DETAIL MODAL DRAWER */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#12110E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#FCFAF7] border border-gold-400/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-none relative text-[#3E301F] font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close pin */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-[#FCFAF7] hover:text-gold-300 transition-colors rounded-full focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Visual Image / Gallery View */}
                <div className="p-6 md:p-8 bg-[#FAF6F0] border-r border-[#CBBDA9]/20 flex flex-col justify-center items-center">
                  {/* Large Expanded Featured Image Box with Magnifier Hover and Click Lightbox */}
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative aspect-square w-full overflow-hidden shadow-lg cursor-zoom-in group bg-neutral-100 rounded-sm"
                    title="Click to view full cinematic gallery"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeGalleryIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        src={
                          selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0
                            ? [selectedProduct.imageUrl, ...selectedProduct.galleryImages][activeGalleryIndex]
                            : selectedProduct.imageUrl
                        }
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms] ease-out select-none"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>

                    {/* Expand indicator overlay details */}
                    <div className="absolute inset-0 bg-neutral-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <div className="bg-black/75 backdrop-blur-sm text-gold-300 text-[10px] uppercase font-bold tracking-widest px-3 py-2 border border-gold-400/20 shadow-lg pointer-events-none">
                        📖 Expand Cinema View
                      </div>
                    </div>

                    {/* Tiny Page Counter overlay */}
                    <div className="absolute bottom-3 left-3 bg-[#12110E]/80 backdrop-blur-md text-[9px] font-mono tracking-tight text-gold-300 font-semibold px-2 py-0.5 pointer-events-none rounded-sm">
                      {activeGalleryIndex + 1} / {1 + (selectedProduct.galleryImages?.length || 0)}
                    </div>
                  </div>

                  {/* Thumbnail Selector list */}
                  {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 && (
                    <div className="flex gap-2.5 mt-4 overflow-x-auto w-full py-1.5 scrollbar-thin">
                      {[selectedProduct.imageUrl, ...selectedProduct.galleryImages].map((imgSrc, thIdx) => (
                        <button
                          key={`gallery-th-${thIdx}`}
                          onClick={() => setActiveGalleryIndex(thIdx)}
                          className={`w-14 h-14 border cursor-pointer hover:border-gold-300 transition-all shrink-0 select-none ${
                            activeGalleryIndex === thIdx 
                              ? "border-gold-400 scale-102 ring-1 ring-gold-400/30 shadow-md opacity-100" 
                              : "border-[#3E301F]/10 opacity-55 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgSrc}
                            alt="Gallery th"
                            className="w-full h-full object-cover pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Technical Product Info Frame */}
                <div className="p-6 md:p-8 md:pl-0 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gold-300 uppercase tracking-[0.2em] font-mono font-semibold bg-[#4A3518]/10 px-2.5 py-1">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.featured && (
                        <span className="text-[9px] uppercase tracking-wider text-rose-500 bg-rose-500/10 font-bold px-2 py-0.5">
                          Featured Original
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl font-light text-[#4A3518]">
                      {selectedProduct.name}
                    </h2>

                    <div className="w-10 h-[1px] bg-gold-400" />

                    <p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    {/* Meta Fields tags grid */}
                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {selectedProduct.tags.map((tag, tIdx) => (
                          <span
                            key={`tag-pill-${tIdx}`}
                            className="text-[9px] uppercase tracking-wider text-[#8C6D4F] bg-gold-400/5 px-2.5 py-1 font-mono hover:bg-gold-400/10 pointer-events-none"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial & CTA action card */}
                  <div className="bg-[#FAF6F0] p-5 border border-gold-400/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-[#8C6D4F] font-light">Acquisition cost</span>
                        {selectedProduct.discountPrice ? (
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-serif font-bold text-emerald-600">
                              {formatNaira(selectedProduct.discountPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatNaira(selectedProduct.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-serif text-[#3E301F] mt-1">
                            {formatNaira(selectedProduct.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-widest text-[#8C6D4F] font-light">Availability</span>
                        <div className="mt-1.5">{renderStockBadge(selectedProduct.stockStatus)}</div>
                      </div>
                    </div>

                    {selectedProduct.quantityAvailable !== null && (
                      <p className="text-[10px] text-gray-500 font-mono">
                        Available Reserve: <span className="font-bold">{selectedProduct.quantityAvailable}</span> remaining packages
                      </p>
                    )}

                    <button
                      onClick={(e) => handleCtaClick(selectedProduct, e)}
                      disabled={selectedProduct.ctaType === "Coming Soon"}
                      className={`w-full text-center py-3.5 px-4 font-sans text-xs uppercase font-bold tracking-[0.18em] transition-all cursor-pointer ${
                        selectedProduct.ctaType === "Coming Soon"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed border-transparent"
                          : "bg-[#4A3518] hover:bg-gold-500 text-[#FAF6F0] hover:text-[#12110E] shadow-md"
                      }`}
                    >
                      {selectedProduct.ctaType === "Order via WhatsApp" && "Direct Order via WhatsApp"}
                      {selectedProduct.ctaType === "Enquire Now" && "Acquire Exclusive Package"}
                      {selectedProduct.ctaType === "Coming Soon" && "Sovereignty Coming Soon"}
                      {selectedProduct.ctaType === "View Details" && "Review details"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Fullscreen Lightbox Modal Overlay */}
      <AnimatePresence>
        {isLightboxOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-955/95 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-6 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Lightbox */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 text-white hover:text-gold-300 transition-all rounded-full cursor-pointer z-[110]"
              title="Close Fullscreen View"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Lightbox Swiper Frame */}
            <div className="relative flex items-center justify-center max-w-5xl w-full h-[75vh]" onClick={(e) => e.stopPropagation()}>
              
              {/* Left Arrow Selection */}
              {1 + (selectedProduct.galleryImages?.length || 0) > 1 && (
                <button
                  onClick={() => {
                    const totalImages = 1 + (selectedProduct.galleryImages?.length || 0);
                    setActiveGalleryIndex(prev => (prev - 1 + totalImages) % totalImages);
                  }}
                  className="absolute left-2 md:-left-16 p-3 bg-white/5 hover:bg-white/10 text-white hover:text-gold-300 transition-colors rounded-full cursor-pointer z-20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Central Expanded Visual Image container */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <motion.img
                  key={activeGalleryIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  src={
                    selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0
                      ? [selectedProduct.imageUrl, ...selectedProduct.galleryImages][activeGalleryIndex]
                      : selectedProduct.imageUrl
                  }
                  alt="Expanded Lightbox View"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xs select-none pointer-events-none"
                />
              </div>

              {/* Right Arrow Selection */}
              {1 + (selectedProduct.galleryImages?.length || 0) > 1 && (
                <button
                  onClick={() => {
                    const totalImages = 1 + (selectedProduct.galleryImages?.length || 0);
                    setActiveGalleryIndex(prev => (prev + 1) % totalImages);
                  }}
                  className="absolute right-2 md:-right-16 p-3 bg-white/5 hover:bg-white/10 text-white hover:text-gold-300 transition-colors rounded-full cursor-pointer z-20"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>

            {/* Bottom visual dots of expanded gallery */}
            {1 + (selectedProduct.galleryImages?.length || 0) > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto max-w-full py-1">
                {[selectedProduct.imageUrl, ...selectedProduct.galleryImages].map((imgSrc, dotIdx) => (
                  <button
                    key={`dot-${dotIdx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGalleryIndex(dotIdx);
                    }}
                    className={`w-12 h-12 border transition-all duration-300 shrink-0 cursor-pointer ${
                      activeGalleryIndex === dotIdx 
                        ? "border-gold-300 scale-102 opacity-100 shadow-md" 
                        : "border-white/10 opacity-40 hover:opacity-75"
                    }`}
                  >
                    <img src={imgSrc} className="w-full h-full object-cover shrink-0 pointer-events-none" alt="" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Aspect counter indicator bottom */}
            <div className="text-[10px] tracking-widest text-[#8C6D4F] uppercase font-mono mt-3">
              Image {activeGalleryIndex + 1} of {1 + (selectedProduct.galleryImages?.length || 0)} — {selectedProduct.name}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
