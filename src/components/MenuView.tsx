import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MENU_ITEMS, MenuItem } from "../types";
import { Flame, Leaf, Snowflake, ShieldAlert, Sparkles, Filter, ChevronRight, X, CalendarCheck2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface MenuViewProps {
  onOpenReservation: () => void;
}

export default function MenuView({ onOpenReservation }: MenuViewProps) {
  // Menu Category selection
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [menuList, setMenuList] = useState<MenuItem[]>(MENU_ITEMS);
  const [catalogFields, setCatalogFields] = useState<any[]>([]);
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

  useEffect(() => {
    // Read from draft or published document depending on active real-time previewMode setting
    const docId = previewMode === "draft" ? "content_catalog_draft" : "content_catalog_published";
    const docRef = doc(db, "admin_settings", docId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.records && data.records.menu_items) {
          const recordsList = data.records.menu_items;
          const mapped = recordsList.map((rec: any) => ({
            id: rec.id || String(Math.random()),
            name: rec.name || rec.title || "Dish",
            description: rec.description || "",
            price: rec.price || "₦0",
            categories: Array.isArray(rec.categories) 
              ? rec.categories 
              : (rec.categories ? String(rec.categories).split(",").map(c => c.trim()) : []),
            dietary: {
              isVegetarian: rec.isVegetarian || false,
              isKidsFriendly: rec.isKidsFriendly || false,
              isSpicy: rec.isSpicy || false,
              isMild: rec.isMild || false,
              isVegan: rec.isVegan || false,
              isGlutenFree: rec.isGlutenFree || false,
              hasNuts: rec.hasNuts || false
            },
            image: rec.image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
            ...rec
          }));
          setMenuList(mapped);
        }
        if (data && data.tables && data.tables.menu_items) {
          setCatalogFields(data.tables.menu_items.fields || []);
        }
      } else {
        // Fallback to local cached compiled structure
        const cached = localStorage.getItem("ona_mock_content_catalog");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.records && parsed.records.menu_items) {
            setMenuList(parsed.records.menu_items);
            if (parsed.tables && parsed.tables.menu_items) {
              setCatalogFields(parsed.tables.menu_items.fields || []);
            }
          }
        }
      }
    }, (error) => {
      console.warn("Could not load real-time content catalog:", error);
    });

    return () => unsubscribe();
  }, []);
  
  // Dietary requirement toggles
  const [onlySpicy, setOnlySpicy] = useState(false);
  const [onlyVegetarian, setOnlyVegetarian] = useState(false);
  const [onlyKidsFriendly, setOnlyKidsFriendly] = useState(false);
  const [onlyGlutenFree, setOnlyGlutenFree] = useState(false);

  const categories = [
    { id: "all", label: "All Curations" },
    { id: "starters", label: "Starters" },
    { id: "signatures", label: "Signatures" },
    { id: "seafood", label: "Sea Harvest" },
    { id: "grills", label: "Hardwood Grills" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "kids", label: "Kids Selection" },
    { id: "sunday", label: "Sunday Roast" },
    { id: "desserts", label: "Pâtisserie" },
    { id: "cocktails", label: "Cocktails" },
    { id: "mocktails", label: "Mocktails" },
    { id: "wine", label: "Wine & Cellar" },
  ];

  // Filtering logic
  const filteredItems = menuList.filter((item) => {
    // 1. Category matches
    if (selectedCategory !== "all" && !item.categories.includes(selectedCategory as any)) {
      return false;
    }
    // 2. Dietary requirements match
    if (onlySpicy && !item.dietary.isSpicy) return false;
    if (onlyVegetarian && !item.dietary.isVegetarian) return false;
    if (onlyKidsFriendly && !item.dietary.isKidsFriendly) return false;
    if (onlyGlutenFree && !item.dietary.isGlutenFree) return false;

    return true;
  });

  const clearFilters = () => {
    setOnlySpicy(false);
    setOnlyVegetarian(false);
    setOnlyKidsFriendly(false);
    setOnlyGlutenFree(false);
    setSelectedCategory("all");
  };

  return (
    <div id="culinary-menu-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-20 relative min-h-screen">
      
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block">La Carte d'Or</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-wide text-white">
            The Culinary Collections
          </h2>
          <p className="text-gray-400 font-sans text-xs uppercase tracking-widest max-w-lg mx-auto">
            Each recipe tells a story of West African landscape, slow-fired to perfection.
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-4" />
        </div>
      </section>

      {/* Category Navigation - Sticky horizontal bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <div className="flex overflow-x-auto gap-3 pb-4 pointer-events-auto border-b border-white/5 scrollbar-thin scrollbar-thumb-gold-400/20 scrollbar-track-transparent">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-[11px] font-sans uppercase tracking-[0.2em] transition-all whitespace-nowrap cursor-pointer rounded-none border ${
                selectedCategory === cat.id
                  ? "bg-gold-500 text-black border-gold-400 font-medium"
                  : "bg-transparent text-gray-400 border-white/5 hover:border-gold-400/40 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Advanced Dietary Filters Bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <div className="bg-[#0f0f0f] border border-gold-400/10 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-400" />
            <span className="font-sans text-xs uppercase tracking-widest text-[#fbf9f4] font-light">
              Filter by Culinary Needs
            </span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Vegetarian preference */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={onlyVegetarian}
                onChange={() => setOnlyVegetarian(!onlyVegetarian)}
                className="w-3.5 h-3.5 accent-gold-500 bg-black border-white/10"
              />
              <span className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-green-400" /> Vegetarian
              </span>
            </label>

            {/* Spicy preference */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={onlySpicy}
                onChange={() => setOnlySpicy(!onlySpicy)}
                className="w-3.5 h-3.5 accent-gold-500 bg-black border-white/10"
              />
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-400" /> Spicy Rubs
              </span>
            </label>

            {/* Kids-Friendly / Mild */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={onlyKidsFriendly}
                onChange={() => setOnlyKidsFriendly(!onlyKidsFriendly)}
                className="w-3.5 h-3.5 accent-gold-500 bg-black border-white/10"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Kids / Mild
              </span>
            </label>

            {/* Gluten Free */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={onlyGlutenFree}
                onChange={() => setOnlyGlutenFree(!onlyGlutenFree)}
                className="w-3.5 h-3.5 accent-gold-500 bg-black border-white/10"
              />
              <span className="flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" /> Gluten Free
              </span>
            </label>

            {/* Clear filters trigger */}
            {(onlySpicy || onlyVegetarian || onlyKidsFriendly || onlyGlutenFree) && (
              <button
                onClick={clearFilters}
                className="text-[10px] text-gold-400 hover:underline uppercase tracking-widest pl-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Menu Grid Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-black/40 border border-[#1b1b1b] hover:border-gold-400/30 transition-all duration-300 group flex flex-col justify-between"
                >
                  {/* Photo area with luxury badges */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-neutral-900 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />

                    {/* Dietary Badges inside image block */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                      {item.dietary.isSpicy && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-sans uppercase bg-black/80 border border-red-500/35 text-red-400 font-semibold tracking-wider">
                          <Flame className="w-3 h-3" /> Spicy
                        </span>
                      )}
                      {item.dietary.isVegetarian && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-sans uppercase bg-black/80 border border-green-500/35 text-green-400 font-semibold tracking-wider">
                          <Leaf className="w-3 h-3" /> Green
                        </span>
                      )}
                      {item.dietary.isKidsFriendly && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-sans uppercase bg-black/80 border border-gold-300/35 text-gold-300 font-semibold tracking-wider">
                          <Sparkles className="w-3 h-3" /> Kids Safe
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="p-6 md:p-8 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#fbf9f4] group-hover:text-gold-300 transition-colors">
                          {item.name}
                        </h3>
                        <span className="font-sans text-xs font-semibold text-gold-300 whitespace-nowrap pl-1">
                          {item.price}
                        </span>
                      </div>
                      <p className="font-sans text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Allergy Advice micro disclaimer */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex flex-wrap gap-2 items-center text-[10px] text-gray-500 font-sans italic">
                        {item.dietary.hasNuts && (
                          <span className="text-amber-500 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Contains Groundnuts
                          </span>
                        )}
                        {item.dietary.isGlutenFree && (
                          <span className="text-sky-400/80">Gluten-Free</span>
                        )}
                        {item.dietary.isMild && (
                          <span className="text-gold-300/70">Extremely Mild Spice</span>
                        )}
                      </div>

                      {/* Dynamic custom columns added by Admin content builder */}
                      {catalogFields.filter(f => f.visibility === "show" && !["id", "name", "description", "price", "categories", "image", "isVegetarian", "isKidsFriendly", "isSpicy", "isMild"].includes(f.id)).map(field => {
                        const val = item[field.id];
                        if (val === undefined || val === null || val === "" || val === false) return null;
                        return (
                          <div 
                            key={field.id} 
                            className="flex justify-between items-center text-[10.5px] font-sans"
                            title={field.helpText || ""}
                          >
                            <span className="text-gray-500 uppercase tracking-widest font-normal text-[9px]">{field.label}:</span>
                            <span className="text-gold-300 font-semibold font-mono">
                              {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4 max-w-sm mx-auto bg-[#0a0a0a] border border-white/5 p-8"
            >
              <X className="w-8 h-8 text-gold-400 mx-auto" />
              <p className="font-serif text-lg text-white">No Matched Curations</p>
              <p className="font-sans text-xs text-gray-400 leading-relaxed">
                We couldn't locate any dishes matching your current filter choices. Adjust your checkboxes to reveal other options.
              </p>
              <button
                onClick={clearFilters}
                className="text-xs uppercase font-sans tracking-widest text-gold-300 hover:text-white underline mt-2"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Advisory Note */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 mt-12 text-center text-[11px] text-gray-500 font-sans max-w-2xl">
        <p className="italic">
          * Allergy Notice: Our recipes utilize wild indigenous spices. Please inform your service host of severe allergies (especially tree nuts, seed oils, or seafood products) during reservation so Chef can customize your ingredients.
        </p>
      </section>

      {/* STICKY “Reserve a Table” CTA (Menu Specific Section Requirement) */}
      <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-md border-t border-gold-400/10 py-4.5 px-6 z-30 flex items-center justify-between shadow-[0_-4px_30px_rgba(0,0,0,0.8)]">
        <div className="hidden sm:flex flex-col text-left max-w-md pl-4">
          <p className="font-sans text-[10px] uppercase tracking-wider text-gold-400 font-light">Custom Gastronomies Available</p>
          <p className="text-xs text-gray-300 font-light truncate">Secure raw tables, family corners, or custom diet curation.</p>
        </div>
        <button
          onClick={onOpenReservation}
          className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3 px-8 w-full sm:w-auto text-center flex items-center justify-center gap-2"
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Tailor Your Table</span>
        </button>
      </div>
    </div>
  );
}
