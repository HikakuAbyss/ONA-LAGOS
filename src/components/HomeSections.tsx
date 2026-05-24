import { motion } from "motion/react";
import { ArrowRight, Star, ChefHat, Wine, Sparkles, MapPin, Clock, Phone, Instagram } from "lucide-react";
import { MENU_ITEMS, GALLERY_ITEMS, TESTIMONIALS } from "../types";

interface HomeSectionsProps {
  cms: any;
  setCurrentTab: (tab: string) => void;
  handleOpenReservation: (type: string) => void;
  DEFAULT_CMS: any;
}

export default function HomeSections({
  cms,
  setCurrentTab,
  handleOpenReservation,
  DEFAULT_CMS
}: HomeSectionsProps) {
  const sectionsList = cms?.homepageSections || [
    { id: "about", visible: true, order: 1 },
    { id: "dishes", visible: true, order: 2 },
    { id: "sunday", visible: true, order: 3 },
    { id: "kids", visible: true, order: 4 },
    { id: "cocktails", visible: true, order: 5 },
    { id: "events", visible: true, order: 6 },
    { id: "gallery", visible: true, order: 7 },
    { id: "testimonials", visible: true, order: 8 }
  ];

  // Dummy instagram feed matching original App.tsx
  const instagramFeed = [
    {
      id: "i1",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80",
      likes: "1,240 likes",
      caption: "Seared Red Snapper drizzled in dynamic botanical clay reductions. Modern West African Gastronomy.",
      user: "ona_lagos"
    },
    {
      id: "i2",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=80",
      likes: "940 likes",
      caption: "Our main dining chamber dressed in soft hand-forged mud textures and golden light portals.",
      user: "elizabeth_dw"
    },
    {
      id: "i3",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=80",
      likes: "2,110 likes",
      caption: "Zesty Palm Wine Sour sprinkled with native botanicals and 24k edible champagne leaf dust.",
      user: "chef_tayo"
    },
    {
      id: "i4",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
      likes: "1,450 likes",
      caption: "The signature Sunday Roast feast. Slow-fired alligator-pepper crusted lamb centerpiece.",
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
    <>
      {/* RENDER DYNAMIC CMS SECTION LISTS */}
      {sectionsList
        .slice()
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((sec: any) => {
          if (sec.visible === false) return null;

          switch (sec.id) {
            case "about":
              return (
                <section id="about-section" key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 bg-root-custom text-left">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 font-medium block">
                        {sec.tagline || "La Maison Ona"}
                      </span>
                      <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                        {sec.heading || "Where Heritage Meets"} <br />
                        <span className="font-serif italic text-gold-300">Modern Gastronomy</span>
                      </h2>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
                        {sec.description || "Ona is inspired by the Edo meaning of a mark or a sign. At Ona Lagos, every detail is meticulously designed to leave a lasting mark—from our signature hospitality and atmosphere to modern African fine dining that marries heritage with global excellence."}
                      </p>
                      <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">
                        Set in a sanctuary of hand-forged mud walls, golden arches, and soft woven fabrics, we celebrate the true luxury of sub-Saharan hospitality. A space crafted with meticulous care to honor business relations, fine diplomats, and dining generations of families alike.
                      </p>
                      <div>
                        <button
                          onClick={() => setCurrentTab("about")}
                          className="cursor-pointer font-sans text-xs uppercase tracking-widest text-gold-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group focus:outline-none"
                        >
                          <span>Our Philosophy & Chef</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    <div className="relative overflow-hidden group">
                      <div className="absolute -inset-1 border border-gold-400/20 translate-x-2 translate-y-2 pointer-events-none" />
                      <img
                        src={sec.bgImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"}
                        alt="Ona Lagos Interior Saloon"
                        className="w-full object-cover aspect-[4/3] border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </section>
              );
            case "lifestyle":
              {
                const activeFeaturedLifestyle = (() => {
                  try {
                    const local = localStorage.getItem("ona_lifestyle_products");
                    if (local) {
                      const parsed = JSON.parse(local);
                      return parsed.filter((p: any) => p.publishStatus === "Published" && p.featured);
                    }
                  } catch (e) {}
                  return [];
                })();

                return (
                  <section id="lifestyle-section" key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 space-y-12 bg-root-custom text-left">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-2">
                        <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">
                          {sec.tagline || "Art of Living"}
                        </span>
                        <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                          {sec.heading || "Ona Lifestyle Collection"}
                        </h3>
                        <p className="font-sans text-xs text-gray-400 font-light max-w-xl">
                          {sec.description || "Bespoke fine-dining pieces and premium merchandise inspired by the Ona Lagos aesthetic."}
                        </p>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setCurrentTab("ona-lifestyle");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="cursor-pointer font-sans text-xs uppercase tracking-widest text-gold-300 hover:text-white flex items-center gap-1.5 border border-gold-400/20 px-5 py-2.5 transition-colors focus:outline-none"
                        >
                          <span>Browse Lifestyle Shop</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    </div>

                    {activeFeaturedLifestyle.length === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#12110E] p-10 border border-gold-400/10 flex flex-col justify-between h-80 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 rounded-full blur-2xl" />
                          <div>
                            <span className="text-[10px] text-gold-300 font-mono tracking-widest uppercase">Atmospherics</span>
                            <h4 className="font-serif text-2xl text-white font-light mt-2">Ona Signature Scented Candle</h4>
                            <p className="text-xs text-gray-400 mt-2 font-light">Alligator pepper, dried sweet orange, and smoked vetiver inside coal-baked mud-baked jar wares.</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab("ona-lifestyle");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-[10px] uppercase font-bold text-gold-300 hover:text-white flex items-center gap-1.5 mt-4 self-start border-b border-gold-400"
                          >
                            Acquire Candle <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="bg-[#12110E] p-10 border border-gold-400/10 flex flex-col justify-between h-80 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 rounded-full blur-2xl" />
                          <div>
                            <span className="text-[10px] text-gold-300 font-mono tracking-widest uppercase">Sovereign hard wood</span>
                            <h4 className="font-serif text-2xl text-white font-light mt-2">Lagos Hardwood Host Platter</h4>
                            <p className="text-xs text-gray-400 mt-2 font-light">Artisanal hand carved West African mahogany board with brushed brass geometric detailing.</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab("ona-lifestyle");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-[10px] uppercase font-bold text-gold-300 hover:text-white flex items-center gap-1.5 mt-4 self-start border-b border-gold-400"
                          >
                            Acquire Platter <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activeFeaturedLifestyle.slice(0, 4).map((p: any) => (
                          <div 
                            key={`featured-home-${p.id}`}
                            onClick={() => {
                              setCurrentTab("ona-lifestyle");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="bg-[#12110E] border border-gold-400/10 hover:border-gold-300/30 overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="aspect-square relative overflow-hidden bg-white/5">
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-3 left-3 bg-[#12110E]/90 text-[8px] uppercase tracking-widest text-[#F4EFE6] px-2 py-0.5 rounded-none font-mono">
                                {p.category}
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <h4 className="font-serif text-sm text-white font-light tracking-wide line-clamp-1 group-hover:text-gold-300 transition-colors">
                                {p.name}
                              </h4>
                              <div className="flex items-center justify-between border-t border-gold-400/10 pt-2.5">
                                <span className="text-xs font-serif text-gold-300">
                                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p.price).replace("NGN", "₦")}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-white/50 border-b border-white/20 pb-0.5 group-hover:text-white group-hover:border-white transition-colors">
                                  View Item &rarr;
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }
            case "dishes":
              return (
                <section id="dishes-section" key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 space-y-12 bg-root-custom text-left">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-2">
                      <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">
                        {sec.tagline || "Visual Plates"}
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                        {sec.heading || "La Carte Signatures"}
                      </h3>
                      {sec.description && (
                        <p className="font-sans text-xs text-gray-400 font-light max-w-xl">{sec.description}</p>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => setCurrentTab("menu")}
                        className="cursor-pointer font-sans text-xs uppercase tracking-widest text-gold-300 hover:text-white flex items-center gap-1.5 border border-gold-400/20 px-5 py-2.5 transition-colors focus:outline-none"
                      >
                        <span>Explore Full Menu</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MENU_ITEMS.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="bg-black border border-[#1b1b1b] hover:border-gold-400/35 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                        onClick={() => setCurrentTab("menu")}
                      >
                        <div className="aspect-square bg-neutral-900 overflow-hidden relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/10 to-transparent p-4" />
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline gap-2 pb-1 border-b border-white/5">
                              <h4 className="font-serif text-lg text-white font-light line-clamp-1">{item.name}</h4>
                              <span className="font-sans text-xs text-gold-300 font-semibold">{item.price}</span>
                            </div>
                            <p className="font-sans text-[11px] text-gray-400 leading-relaxed line-clamp-2 font-light">
                              {item.description}
                            </p>
                          </div>

                          <div className="text-[9px] uppercase font-mono tracking-widest text-gold-400">
                            {item.dietary.isSpicy && "Spicy "}
                            {item.dietary.isVegetarian && "Vegetarian Pure "}
                            {item.dietary.isKidsFriendly && "Mild Kids Safe"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "sunday":
              return (
                <section id="sunday-section" key={sec.id} className="bg-[#0b0805] py-20 border-b border-gold-400/10 text-left">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 space-y-6">
                      <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-300 font-normal block">
                        {sec.tagline || "Weekend Festivities"}
                      </span>
                      <h3 className="font-serif text-3xl sm:text-5xl font-light text-white leading-normal">
                        {sec.heading || "The Imperial Sunday Roast"}
                      </h3>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
                        {sec.description || "Sunday is a sacred day of assembly in Lagos. Our grand fireplace comes alive at noon with slow oak-roasted Imperial Leg of Lamb encrusted in alligator pepper, honey, and local tarragon, alongside golden rosemary yams and whole caramelized guinea fowl."}
                      </p>
                      <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">
                        Accompanied by palm-wine mimosa pitchers, live afro-jazz instrumentation, and an immersive courtyard atmosphere. Highly comfortable and welcoming for full family arrangements.
                      </p>

                      <div className="pt-2 flex flex-wrap gap-4 items-center">
                        <button
                          onClick={() => handleOpenReservation("Sunday Roast")}
                          className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase font-semibold tracking-widest py-3 px-6"
                        >
                          Book Sunday Roast
                        </button>
                        <span className="text-xs text-gold-300 font-serif italic">Every Sunday — 11:30 AM to 4:00 PM</span>
                      </div>
                    </div>

                    <div className="lg:col-span-6 relative group">
                      <div className="absolute -inset-1 border border-gold-400/25 translate-x-3 translate-y-3 pointer-events-none" />
                      <img
                        src={sec.bgImage || "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80"}
                        alt="Leg of Lamb Roast Sunday - Ona Lagos"
                        className="w-full object-cover aspect-video border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </section>
              );
            case "kids":
              return (
                <section id="kids-section" key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-root-custom text-left">
                  <div className="lg:col-span-5 relative group order-last lg:order-first">
                    <div className="absolute -inset-1 border border-gold-400/20 translate-x-2 translate-y-2 pointer-events-none" />
                    <img
                      src={sec.bgImage || "https://images.unsplash.com/photo-1566453983492-411db181e194?w=800&auto=format&fit=crop&q=80"}
                      alt="Premium family dining - plantain dodo and cheese cubes"
                      className="w-full object-cover aspect-[4/3] lg:aspect-square border border-white/5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-black/90 p-4 border border-gold-400/10 text-left space-y-1">
                      <p className="font-serif text-xs text-gold-300">"A Legacy of Warmth"</p>
                      <p className="font-sans text-[9px] text-gray-500 uppercase tracking-widest font-sans">High-Chairs & stroller spacing ready</p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-400 font-medium block">
                      {sec.tagline || "Inclusive Hospitality"}
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                      {sec.heading || "Bespoke Family Hospitality & Allergy Curation"}
                    </h3>
                    <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
                      {sec.description || "True luxury understands care. At Ona Lagos, we reject the notion that fine dining should be stiff or exclusionary. Our dining saloon is prepared to host generations of families, offering elegant pediatric high-chairs, stroller spacing, and child safe zones."}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#0d0d0d] border border-white/5 space-y-1">
                        <h4 className="font-serif text-base text-gold-300">Non-Spicy & Kids Menu</h4>
                        <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
                          Truffled croquettes, mild chicken skewers, and sweet plantain cheese bites. Pure local ingredients cooked without any peppers.
                        </p>
                      </div>

                      <div className="p-4 bg-[#0d0d0d] border border-white/5 space-y-1">
                        <h4 className="font-serif text-base text-gold-300">Allergen Safety Port</h4>
                        <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
                          Strict segregation guidelines. If you specify nut, dairy, or shellfish restrictions, our chefs handle ingredients in targeted pans.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setCurrentTab("kids-dietary")}
                        className="cursor-pointer font-sans text-xs uppercase tracking-widest text-gold-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group focus:outline-none"
                      >
                        <span>Explore family &amp; dietary details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </section>
              );
            case "cocktails":
              return (
                <section id="cocktails-section" key={sec.id} className="bg-black py-20 border-b border-gold-400/10 text-left">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 font-normal block">
                        {sec.tagline || "The Cellar & Shaker"}
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                        {sec.heading || "Artisanal Mixology & Vintage Champagne"}
                      </h3>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
                        {sec.description || "Our elixir lineup explores West African botanical chemistry. Imbibe native fresh Palm Wine sour whisked with aged whiskey and pure edible gold dust, or enjoy a sunset lemongrass sugarcane rum shaker."}
                      </p>
                      <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">
                        For vintage aficionados, our private cellar is stocked with Dom Pérignon Brut, Napa Cabernets, and curated selections to complement high-heat suya rubs perfectly.
                      </p>

                      <div className="pt-2">
                        <button
                          onClick={() => setCurrentTab("menu")}
                          className="cursor-pointer bg-transparent hover:bg-gold-500/10 border border-gold-400/50 text-gold-300 hover:text-white font-sans text-xs uppercase tracking-widest py-3 px-6 transition-colors"
                        >
                          Browse Cellar Cards
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <img
                        src={sec.bgImage || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80"}
                        alt="Ona Lagos Cocktails"
                        className="w-full object-cover aspect-[4/5] border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80"
                        alt="Palm wine sour with gold flakes"
                        className="w-full object-cover aspect-[4/5] border border-white/5 mt-6"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </section>
              );
            case "events":
              return (
                <section id="events-section" key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 bg-root-custom text-left">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5 relative group order-last lg:order-first">
                      <div className="absolute -inset-1 border border-gold-400/20 translate-x-2 translate-y-2 pointer-events-none" />
                      <img
                        src={sec.bgImage || "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80"}
                        alt="Private dining event setup - Ona Lagos"
                        className="w-full object-cover aspect-[4/3] lg:aspect-square border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/95 text-xs text-gold-300 px-4 py-2 border border-gold-400/10 font-serif">
                        Up to 80 seated guests
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6 text-left">
                      <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-400 font-medium block">
                        {sec.tagline || "Exclusive Curations"}
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                        {sec.heading || "Custom Celebrations, Birthdays & Movie Shoots"}
                      </h3>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
                        {sec.description || "From candlelit romantic proposals inside our underground wine cellar to sweeping global brand product rollouts, film/movie setups, and corporate leadership dinners, our spaces are fully customizable."}
                      </p>
                      <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">
                        Our private events hosts provide hand-crafted menu coordination, table florals, and full-space privacy setups.
                      </p>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <button
                          onClick={() => setCurrentTab("events")}
                          className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-widest font-semibold py-3 px-6"
                        >
                          Submit Private Dining Enquiry
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              );
            case "gallery":
              return (
                <section id="gallery-section" key={sec.id} className="bg-[#070707] py-20 border-b border-gold-400/10 text-left">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-1.5 font-serif">
                        <span className="font-sans text-xs uppercase tracking-widest text-gold-400 block">
                          {sec.tagline || "The Archival Glimpse"}
                        </span>
                        <h3 className="font-serif text-3xl text-white font-light">
                          {sec.heading || "Visual Archives preview"}
                        </h3>
                        {sec.description && (
                          <p className="font-sans text-xs text-gray-400 font-light max-w-xl">{sec.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentTab("gallery")}
                        className="cursor-pointer font-sans text-xs uppercase text-gold-300 hover:text-white transition-colors tracking-widest"
                      >
                        Enter full visual library &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {GALLERY_ITEMS.slice(0, 4).map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setCurrentTab("gallery")}
                          className="aspect-square bg-neutral-900 overflow-hidden relative group cursor-pointer border border-white/5"
                        >
                          <img
                            src={img.image}
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-center">
                            <p className="font-serif text-xs text-white uppercase tracking-wider font-light line-clamp-2">{img.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            case "testimonials":
              return (
                <section id="testimonials-section" key={sec.id} className="bg-black py-20 border-b border-gold-400/10 relative text-left">
                  <div className="absolute top-20 left-10 w-48 h-48 bg-gold-400/5 rounded-full blur-[80px]" />
                  <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
                    <div className="space-y-2 font-serif">
                      <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-normal">
                        {sec.tagline || "La Vérité — Gossip & Critic"}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-4xl text-white font-light">
                        {sec.heading || "Gastronomic Appreciations"}
                      </h3>
                      {sec.description && (
                        <p className="font-sans text-xs text-gray-400 font-light max-w-xl mx-auto">{sec.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                      {TESTIMONIALS.map((t, idx) => (
                        <div key={idx} className="p-6 bg-[#090909] border border-white/5 space-y-4">
                          <div className="flex items-center gap-1 font-sans">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                            ))}
                          </div>
                          <p className="font-serif text-sm italic text-gray-300 leading-relaxed font-light">
                            “{t.comment}”
                          </p>
                          <div className="border-t border-white/5 pt-3">
                            <h4 className="font-serif text-[#fbf9f4] font-medium text-base">{t.name}</h4>
                            <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest">{t.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            default:
              return null;
          }
        })}

      {/* 12. INSTAGRAM-STYLE SOCIAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-gold-400/10 space-y-10 text-left bg-root-custom">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Instagram className="w-4 h-4 text-gold-400" />
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-semibold">
              {cms?.socials?.instagram || "@ona_lagos"}
            </span>
          </div>
          <h3 className="font-serif text-3xl font-light text-white">Join the Ona Society</h3>
          <p className="font-sans text-xs text-gray-500 tracking-widest">TAG US TO SHARE YOUR CULINARY MOMENTS ON VICTORIA ISLAND</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 font-sans">
          {instagramFeed.map((post) => (
            <a
              href={`https://instagram.com/${(cms?.socials?.instagram || "ona_lagos").replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              key={post.id}
              className="aspect-square bg-neutral-900 border border-white/5 overflow-hidden relative group block"
            >
              <img
                src={post.image}
                alt="Instagram moment"
                className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-left">
                <span className="font-mono text-[9px] text-gold-400">@{post.user}</span>
                <div className="space-y-1">
                  <p className="font-sans text-[9px] text-gray-300 line-clamp-3 font-light leading-relaxed">
                    {post.caption}
                  </p>
                  <span className="text-[10px] text-gold-300 font-semibold">{post.likes}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 13. RESERVATION CALL-TO-ACTION (Home bottom section) */}
      <section className="bg-gradient-to-t from-black via-[#0d0a07] to-black py-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10 text-left sm:text-center">
          <div className="space-y-3 font-serif">
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-400 font-normal">Become Our Guest</span>
            <h3 className="font-serif text-3xl sm:text-5xl font-light text-white leading-normal">
              Initiate Your Dining Curation
            </h3>
            <p className="font-sans text-sm sm:text-base text-gray-300 font-light max-w-lg mx-auto leading-relaxed">
              We curate specialized tables, high-chairs for families, personalized heat intensities, and deep candle-lit proposals. Secure your reservation securely now.
            </p>
          </div>

          <div>
            <button
              onClick={() => handleOpenReservation("Standard Dining")}
              className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase font-semibold tracking-[0.2em] py-4 px-10 transition-colors shadow-[0_4px_20px_rgba(181,137,75,0.25)]"
            >
              Book Your Experience
            </button>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">
            GATEWAY TARGET: {cms?.branding?.bookingDomain || "RESERVE.ONALAGOS.COM"}
          </p>
        </div>
      </section>
    </>
  );
}
