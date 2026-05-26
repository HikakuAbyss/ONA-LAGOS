import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  GlassWater
} from "lucide-react";

interface ExploreLegacyWidgetProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenReservation: (type?: string) => void;
}

export default function ExploreLegacyWidget({
  currentTab,
  setCurrentTab,
  onOpenReservation,
}: ExploreLegacyWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const QuickPaths = [
    {
      id: "home",
      label: "La Maison (Home)",
      desc: "Our high design sanctuary in Victoria Island",
      icon: Sparkles
    },
    {
      id: "about",
      label: "Our Story & Chef Philosophy",
      desc: "Ancestral clay roasts & modern gastronomy",
      icon: Award
    },
    {
      id: "menu",
      label: "La Carte Signatures (Menu)",
      desc: "Suya deconstructions & botanical shakers",
      icon: BookOpen
    },
    {
      id: "kids-dietary",
      label: "Family & Dietary Support",
      desc: "Pediatric kids safe zones & allergen segregration",
      icon: GlassWater
    },
    {
      id: "ona-lifestyle",
      label: "ONA Lifestyle Store",
      desc: "Premium merchandise, gift items & fine accessories",
      icon: Compass
    },
    {
      id: "events",
      label: "Bespoke Private Events",
      desc: "Birthdays, film setups & underground cellar bookings",
      icon: Layers
    }
  ];

  const handleNavigate = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  const handleBookNow = () => {
    setIsOpen(false);
    onOpenReservation("Special Dining Request");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex items-center gap-2">
        {/* Cute AI Speech Bubble saying "Explore with ONA!" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 120 }}
          className="relative bg-[#FCFAF7] text-gold-700 font-sans text-[11px] leading-none tracking-widest py-2.5 px-3.5 rounded-xl border border-gold-500/40 whitespace-nowrap shadow-[0_4px_20px_rgba(181,137,75,0.15)] flex items-center gap-1.5 select-none"
        >
          <span className="font-sans uppercase text-[10px] tracking-widest font-medium text-gold-800">Explore with ONA</span>
          <span className="inline-block animate-bounce text-gold-600">✨</span>
          {/* Speech Bubble Arrow pointing to the right */}
          <div className="absolute -right-[4.5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#FCFAF7] border-r border-t border-gold-500/40 rotate-45" />
        </motion.div>

        <button
          id="explore-legacy-fab"
          onClick={() => setIsOpen(true)}
          className="cursor-pointer group relative flex h-14 w-14 items-center justify-center rounded-full bg-gold-600 border border-gold-400/50 shadow-[0_4px_25px_rgba(181,137,75,0.35)] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Explore Legacy Pathways"
        >
          {/* Subtle Outer Radiating Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gold-400/20 opacity-75 blur-sm animate-pulse" />
          
          {/* Cute Interactive Sunshine ONA */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Pulsing Light Aura */}
            <span className="absolute w-8 h-8 rounded-full bg-amber-400/20 blur-md animate-pulse" />
            
            {/* Spinning Sunshine Rays */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
              className="absolute w-10 h-10 flex items-center justify-center"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-2 bg-amber-400/90 rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-14px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Glowing Sun Core Face */}
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-200 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
              {/* Cute Smiling Eyes */}
              <div className="flex gap-1.5 justify-center w-full mt-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-950" />
                <span className="w-1 h-1 rounded-full bg-amber-950" />
              </div>
              
              {/* Cute little rosy blush cheeks */}
              <div className="absolute inset-x-0 top-3 flex justify-between px-1.5">
                <span className="w-0.5 h-0.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="w-0.5 h-0.5 rounded-full bg-rose-400 animate-pulse" />
              </div>

              {/* Happy little mouth arc */}
              <svg className="w-2.5 h-1 text-amber-950 mt-0.5" viewBox="0 0 10 5" fill="none">
                <path d="M1 1 Q5 4 9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Accessible Interactive Legacy Overlay Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark glass backdrop overlay -> styled softly in translucent gold-beige */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-[#FAF6F0]/70 backdrop-blur-sm"
            />

            {/* Centered Panel Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-x-4 bottom-24 md:inset-x-auto md:right-6 md:bottom-24 z-50 max-w-md w-full md:w-[400px] bg-[#FCFAF7] border border-gold-500/30 p-6 shadow-[0_15px_50px_rgba(181,137,75,0.12)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gold-500/20">
                <div className="flex items-center gap-3">
                  {/* Matching Cute Mini Sunshine Header Icon */}
                  <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="absolute w-6 h-6 rounded-full bg-amber-400/10 blur-sm animate-pulse" />
                    
                    {/* Spinning Rays for Mini Sun */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                      className="absolute w-8 h-8 flex items-center justify-center"
                    >
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[3px] h-1.5 bg-amber-400/90 rounded-full"
                          style={{
                            transform: `rotate(${i * 60}deg) translateY(-10px)`,
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Mini Sun core with cute smiling face */}
                    <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 border border-amber-200 flex flex-col items-center justify-center">
                      <div className="flex gap-0.5 justify-center w-full mt-1.5">
                        <span className="w-0.5 h-0.5 rounded-full bg-amber-950" />
                        <span className="w-0.5 h-0.5 rounded-full bg-amber-950" />
                      </div>
                      <svg className="w-2 h-0.5 text-amber-950 mt-0.5" viewBox="0 0 10 5" fill="none">
                        <path d="M1 1 Q5 4 9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-gold-950 tracking-wide font-normal">
                      ONA Cultural Concierge
                    </h3>
                    <p className="font-mono text-[9px] text-gold-600 tracking-wider">
                      DIGITAL AMBASSADOR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full border border-gold-500/20 bg-gold-100/50 hover:bg-gold-500/10 text-gold-800 hover:text-gold-900 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Headline & Context */}
              <div className="py-4 space-y-1">
                <p className="font-sans text-xs text-gold-900 font-light leading-relaxed">
                  Hi, I am <strong className="text-gold-600 font-semibold">ONA</strong>! Let me guide you seamlessly through the architectural, pediatric, mixology, and celebration chambers of Ona Victoria Island.
                </p>
              </div>

              {/* Path List */}
              <div className="space-y-2.5 my-4 max-h-[300px] overflow-y-auto pr-1">
                {QuickPaths.map((path) => {
                  const Icon = path.icon;
                  const isActive = currentTab === path.id;

                  return (
                    <button
                      key={path.id}
                      onClick={() => handleNavigate(path.id)}
                      className={`w-full text-left p-3 border transition-all duration-200 flex items-start gap-3.5 group cursor-pointer ${
                        isActive
                          ? "bg-gold-500/10 border-gold-500/40"
                          : "bg-[#FAF6F0] border-gold-500/10 hover:border-gold-300"
                      }`}
                    >
                      <div className={`p-2 rounded border transition-colors ${
                        isActive ? "bg-gold-500/20 border-gold-500/35 text-gold-700" : "bg-[#F3EDE2] border-gold-500/10 text-gold-700 group-hover:text-gold-800"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-grow space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`font-serif text-xs uppercase tracking-wider ${
                            isActive ? "text-gold-700 font-semibold" : "text-gold-950"
                          }`}>
                            {path.label}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="font-sans text-[11px] text-gold-800 font-light leading-relaxed">
                          {path.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct Reservation Accelerator Button */}
              <div className="pt-3 border-t border-gold-500/20 flex flex-col gap-2">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs uppercase tracking-widest font-semibold py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Prompt Instant Table</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 py-1 text-[9px] text-gold-600 uppercase tracking-widest font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated Secure Gateway</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
