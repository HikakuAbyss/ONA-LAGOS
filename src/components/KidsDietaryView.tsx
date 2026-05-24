import { motion } from "motion/react";
import { MENU_ITEMS } from "../types";
import { Sparkles, HelpingHand, ShieldCheck, HeartPulse, SlidersHorizontal, GlassWater } from "lucide-react";

interface KidsDietaryViewProps {
  onOpenReservation: () => void;
  onViewMenu: () => void;
}

export default function KidsDietaryView({ onOpenReservation, onViewMenu }: KidsDietaryViewProps) {
  // Extract food targeted specifically for children & healthy options
  const kidsItems = MENU_ITEMS.filter(it => it.categories.includes("kids"));
  const vegItems = MENU_ITEMS.filter(it => it.categories.includes("vegetarian") && !it.categories.includes("kids")).slice(0, 2);

  return (
    <div id="family-dietary-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-16">
      
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block font-light">Heritage & Care</span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white">
            Family & Conscious Dining
          </h2>
          <p className="text-gray-400 font-sans text-xs sm:text-sm tracking-widest max-w-xl mx-auto leading-relaxed">
            Multi-generational dining with delicate attention. We believe fine dining should be comfortable for children and safe for severe allergies.
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-4" />
        </div>
      </section>

      {/* Editorial Split: Comfort & Safety */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-serif text-3xl font-light text-white">
              An Elevated Sanctuary for the Whole Family
            </h3>
            <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">
              In West Africa, dining is traditionally a collective, familial celebration. At Ona Lagos, we honor this legacy by crafting an atmosphere where younger family members are treated with the exact same respect, elegance, and warm hospitality as their parents.
            </p>
          </div>

          <div className="space-y-6">
            {/* Spice tailoring */}
            <div className="flex gap-4 p-4 border border-gold-400/10 bg-[#0c0c0c]">
              <SlidersHorizontal className="w-5 h-5 text-gold-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-white font-light">Tailored Mild Spices</h4>
                <p className="font-sans text-xs text-gray-400 font-light">
                  West African food is celebrated for heat. For our children, our culinary team prepares custom non-spicy, mild alternatives that preserve the rich herbal aroma without the fire.
                </p>
              </div>
            </div>

            {/* High-Chair Accommodations */}
            <div className="flex gap-4 p-4 border border-gold-400/10 bg-[#0c0c0c]">
              <HelpingHand className="w-5 h-5 text-gold-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-white font-light">Luxury High-Chairs & Space</h4>
                <p className="font-sans text-xs text-gray-400 font-light">
                  High-aesthetic, robust design high-chairs are ready for our toddlers. Our seating layouts offer wide spacing to accommodate strollers and family grouping coordinates quietly.
                </p>
              </div>
            </div>

            {/* Allergy Consciousness */}
            <div className="flex gap-4 p-4 border border-gold-400/10 bg-[#0c0c0c]">
              <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-white font-light">Allergy Segregation Procedures</h4>
                <p className="font-sans text-xs text-gray-400 font-light">
                  Our kitchens practice strict allergen separation. If you specify nut or shell-fish restrictions during booking, we use fully segregated pans and cutting boards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Illustration of premium family hospitality */}
        <div className="relative group">
          <div className="absolute -inset-1 border border-gold-400/15 translate-x-2 translate-y-2" />
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80"
            alt="Suya ribeye sliced elegantly - Ona Lagos culinary presentation"
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/90 border border-gold-400/10 px-4 py-3">
            <p className="font-serif text-xs text-gold-300">"Warmth is our greatest recipe."</p>
            <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest">Ona Lagos Hospitality Principle</p>
          </div>
        </div>
      </section>

      {/* Featured Kids Curations */}
      <section className="bg-black/30 border-y border-gold-300/10 py-16 md:py-20 mb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 block font-light">The Kids Salon</span>
            <h3 className="font-serif text-3xl text-white font-light">Gourmet Creations for Our Youngest Guests</h3>
            <p className="font-sans text-xs text-gray-400 max-w-md mx-auto">
              Prepared with premium ingredients, low sodium, and absolute love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {kidsItems.map((item) => (
              <div key={item.id} className="bg-black/60 border border-white/5 overflow-hidden group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 bg-gold-500 text-black px-2 py-0.5 text-[9px] font-sans uppercase font-bold tracking-wider">
                    Mild
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex justify-between items-baseline gap-2 border-b border-white/5 pb-2">
                    <h4 className="font-serif text-lg text-white font-light">{item.name}</h4>
                    <span className="font-sans text-xs text-gold-400 font-semibold">{item.price}</span>
                  </div>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vegetarian & Conscious Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 block">Conscious Gastronomy</span>
            <h3 className="font-serif text-3xl text-white font-light">Vegetarian & Plant-Based Mastery</h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
            We understand that luxurious dining includes diverse, robust vegetarian options. Rather than simple salads, our plant-based selections are curated as complex, nutrient-dense sensory highlights.
          </p>
          <button
            onClick={onViewMenu}
            className="cursor-pointer font-sans text-xs text-gold-300 uppercase tracking-widest hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <span>Explore full menus</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {vegItems.map((item) => (
            <div key={item.id} className="p-6 border border-gold-300/10 bg-[#0e0e0e] space-y-4">
              <span className="text-[10px] text-green-400 font-sans uppercase tracking-widest border border-green-500/20 px-2 py-0.5 inline-block">
                Vegetarian Pure
              </span>
              <div className="space-y-1">
                <h4 className="font-serif text-xl text-[#fbf9f4] font-light">{item.name}</h4>
                <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">{item.description}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-sans text-xs text-gold-400">{item.price}</span>
                {item.dietary.isVegan && <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-sans">Vegan Option</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct reservation for families */}
      <section className="max-w-4xl mx-auto px-6 text-center py-12 border-t border-white/5 mt-16 space-y-6">
        <h4 className="font-serif text-2xl text-white font-light">Planning a Large Family Gathering?</h4>
        <p className="font-sans text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Whether you need a discrete private dining box with kids play alignments or special allergen planning, select family options in our Reservation gateway.
        </p>
        <button
          onClick={onOpenReservation}
          className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3.5 px-8"
        >
          Book Family Table
        </button>
      </section>

    </div>
  );
}
