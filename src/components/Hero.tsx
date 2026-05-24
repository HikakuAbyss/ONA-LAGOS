import { motion } from "motion/react";
import { ChevronDown, Calendar, ArrowRight } from "lucide-react";

interface HeroProps {
  onOpenReservation: () => void;
  onViewMenu: () => void;
  cms?: any;
}

export default function Hero({ onOpenReservation, onViewMenu, cms }: HeroProps) {
  const overlayValue = cms?.hero?.overlayOpacity !== undefined ? cms.hero.overlayOpacity : 40;
  const showOverlay = cms?.hero?.toggleOverlay !== false;

  return (
    <section id="cinema-hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAF6F0]">
      {/* Background Cinematic Food/Ambiance Imagery or Premium Dark Overlay */}
      <div className="absolute inset-0 z-0">
        {cms?.hero?.backgroundVideo ? (
          <video
            src={cms.hero.backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105"
          />
        ) : (
          <img
            src={cms?.hero?.backgroundImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80"}
            alt="Ona Lagos Fine Dining Atmosphere"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-subtle-zoom"
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Soft overlays */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayValue / 100 }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Hero Inner Content */}
      <div className="relative z-10 text-center max-w-4xl px-6 md:px-12 flex flex-col items-center space-y-4 md:space-y-6 lg:space-y-8">
        {/* Brand Crest Accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex justify-center items-center mb-1"
        >
          <div className="border border-gold-300/30 px-3 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-light text-gold-200">
              {cms?.branding?.tagline || "VICTORIA ISLAND, LAGOS"}
            </span>
          </div>
        </motion.div>

        {/* Master Headline */}
        <div className="space-y-3 md:space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7.5xl font-light tracking-wide text-white leading-[1.1]"
          >
            {cms?.hero?.title ? cms.hero.title : (
              <>
                Experience Modern <br />
                <span className="font-serif italic font-normal text-gold-300">African Fine Dining</span>
              </>
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100px" }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto my-4 md:my-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="font-sans text-xs sm:text-sm md:text-base lg:text-lg font-light text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            {cms?.hero?.subtitle || "Ona Lagos is a modern African fine-dining destination designed to leave a lasting mark through food, culture, atmosphere, and hospitality."}
          </motion.p>
        </div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full mt-2 font-sans"
        >
          {/* Reservation Button - opens modal */}
          <button
            onClick={onOpenReservation}
            className="w-full sm:w-auto cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3.5 px-6 sm:py-4 sm:px-8 transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(181,137,75,0.25)] hover:shadow-[0_4px_30px_rgba(181,137,75,0.4)] animate-pulse"
          >
            <span>{cms?.hero?.ctaText || "Reserve a Table"}</span>
          </button>

          {/* View Menu Button */}
          <button
            onClick={onViewMenu}
            className="w-full sm:w-auto cursor-pointer bg-transparent hover:bg-white/5 border border-white/10 hover:border-gold-400 text-[#fbf9f4] font-sans text-xs uppercase tracking-[0.2em] font-light py-3.5 px-6 sm:py-4 sm:px-8 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4 text-gold-400 transition-transform group-hover:translate-x-1.5" />
          </button>
        </motion.div>
      </div>

      {/* Micro Scrolling indicator at the bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-gray-400 transition-colors hover:text-gold-300">
        <ChevronDown className="w-4 h-4 animate-bounce text-gold-400" />
      </div>

      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </section>
  );
}
