import { motion } from "motion/react";
import { Sparkles, Heart, Award, BookmarkCheck } from "lucide-react";

interface AboutViewProps {
  onOpenReservation: () => void;
}

export default function AboutView({ onOpenReservation }: AboutViewProps) {
  return (
    <div id="about-storytelling-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-16">
      {/* Editorial Header Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block font-normal">
            La Sagesse — Our Narrative
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light tracking-wide text-white leading-tight max-w-4xl mx-auto">
            Rooted in African Heritage, <br />
            <span className="font-serif italic text-gold-300">Refined for the Global Stage</span>
          </h2>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-6" />
        </motion.div>
      </section>

      {/* Main Narrative Split Screen */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center py-8">
        {/* Story Text (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-gray-300 font-sans text-sm md:text-base font-light leading-relaxed">
          <p className="font-serif text-2xl text-white font-light leading-relaxed tracking-wide italic border-l-2 border-gold-400/40 pl-4">
            “At Ona, every detail is designed to leave a mark — from the atmosphere and hospitality to the flavours that celebrate contemporary African cuisine.”
          </p>
          <p>
            Inspired by the Edo meaning of <span className="font-serif italic text-gold-300">‘Ona’</span>, a mark or sign, Ona Lagos exists as more than a restaurant. It is a refined cultural and dining experience where modern African identity meets elegance, connection, and unforgettable moments. Our brand identity is culturally rooted, leaving a silent signature of excellence on every guest.
          </p>
          <p>
            Located in the cosmopolitan heart of Victoria Island, Lagos, Ona is a destination designed to leave a lasting mark through food, culture, atmosphere, and hospitality. We reinterpret indigenous West African ingredients — from fermented locust beans (iru) and scented native leaves (effirin) to dried hibiscus petals (zobo) and grains of paradise — into visual, sensory masterpieces of distinction.
          </p>
          <p>
            At Ona, we believe luxury should never be austere. Inspired by our signature hospitality and the rich multi-generational fabric of modern families, our space provides a sophisticated sanctuary that is deeply welcoming. Here, we cater with equal meticulousness to diplomats, artists, romantic celebrations, and guests seeking memorable culinary experiences.
          </p>
          
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs tracking-wider uppercase">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5">
              <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Artisanal African Chemistry</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5">
              <Heart className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Warm Family Hospitality</span>
            </div>
          </div>
        </div>

        {/* Cinematic Illustration (5 cols) */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute -inset-2 border border-gold-400/20 translate-x-3 translate-y-3 transition-transform group-hover:translate-x-1 group-hover:translate-y-1 duration-500" />
          <div className="relative overflow-hidden bg-black">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
              alt="Ona Lagos Main Dining room"
              className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-serif text-white text-lg tracking-wider font-light">The Dining Saloon</p>
              <p className="font-sans text-[10px] text-gold-400 tracking-widest uppercase">Handmolded organic luxury clay structures</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Chef Story (Vertical flow or side-by-side) */}
      <section className="bg-black/40 border-y border-gold-300/10 py-16 md:py-24 mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chef Image */}
          <div className="relative overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80"
              alt="Chef de Cuisine - Ona Lagos Cuisine Team"
              className="w-full object-cover aspect-video lg:aspect-[4/3]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <p className="font-serif italic text-gold-300 text-lg">“Gourmet is an ancestral legacy”</p>
              <p className="font-sans text-[11px] text-gray-400 uppercase tracking-widest">- Executive Chef Team, Ona Lagos</p>
            </div>
          </div>

          {/* Chef Story Text */}
          <div className="space-y-6">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 block">Chef-Driven Experience</span>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-light">Gastronomy Guided by Instinct & Technique</h3>
            <p className="font-sans text-sm text-gray-400 font-light leading-relaxed">
              Our kitchen operation is guided by the core belief that African food has always been sophisticated, complex, and profound. Our culinary collection deconstructs ancestral stews, charcoal roasts, fermented spices, and structural grain presentation with elite European fine-dining techniques.
            </p>
            <p className="font-sans text-sm text-gray-400 font-light leading-relaxed">
              Every reduction requires hours of slow simmering, and every steak is kissed with hardwood smoke of Nigerian mahogany. We source locally from organic growers in Epe and Lagos mainland, curating rare indigenous varieties of greens, peppers, and wild maritime treasures.
            </p>
            
            <div className="border-t border-white/5 pt-6 flex items-center gap-6">
              <div className="space-y-1">
                <p className="font-serif text-gold-300 text-lg font-light">West African Michelin-inspired</p>
                <p className="font-sans text-[11px] text-gray-500 uppercase tracking-wider">Curated dining philosophy</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="space-y-1">
                <p className="font-serif text-gold-300 text-lg font-light">100% Locally Sourced Roots</p>
                <p className="font-sans text-[11px] text-gray-500 uppercase tracking-wider">From independent premium growers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Foundations grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-12">
        <div className="text-center space-y-2">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-400 font-light">Our Pillars of Craft</p>
          <h3 className="font-serif text-3xl md:text-4xl text-white font-light">Four Spheres of Experiential Luxury</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white/[0.01] border border-gold-300/10 relative group hover:border-gold-300/35 transition-colors duration-300">
            <Award className="w-8 h-8 text-gold-400 mb-4" />
            <h4 className="font-serif text-xl text-white mb-2 font-light">High Culinary Artistry</h4>
            <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">
              Deconstructing Jollof, Efo, and Suya with elite chemical plating and structural textures.
            </p>
          </div>

          <div className="p-6 bg-white/[0.01] border border-gold-300/10 relative group hover:border-gold-300/35 transition-colors duration-300">
            <Heart className="w-8 h-8 text-gold-400 mb-4" />
            <h4 className="font-serif text-xl text-white mb-2 font-light">Family Welcome</h4>
            <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">
              Designing premium mild kids menus and rich comfortable private dining suites for family banquets.
            </p>
          </div>

          <div className="p-6 bg-white/[0.01] border border-gold-300/10 relative group hover:border-gold-300/35 transition-colors duration-300">
            <Sparkles className="w-8 h-8 text-gold-400 mb-4" />
            <h4 className="font-serif text-xl text-white mb-2 font-light">Cultural Immersion</h4>
            <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">
              The ambiance glows with hand-sculpted clay, woven fibers, and deep, warm organic background audio nodes.
            </p>
          </div>

          <div className="p-6 bg-white/[0.01] border border-gold-300/10 relative group hover:border-gold-300/35 transition-colors duration-300">
            <BookmarkCheck className="w-8 h-8 text-gold-400 mb-4" />
            <h4 className="font-serif text-xl text-white mb-2 font-light">Bespoke Curation</h4>
            <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">
              Tailoring events, proposals, birthdays, and corporate celebrations with fully customized gastromony.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={onOpenReservation}
            className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-4 px-10 transition-colors"
          >
            Experience the Distinction of Ona
          </button>
        </div>
      </section>
    </div>
  );
}
