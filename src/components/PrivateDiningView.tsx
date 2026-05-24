import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Wine, Film, Gem, Landmark, CheckCircle, Mail, Phone, Calendar, Send } from "lucide-react";

interface PrivateDiningViewProps {
  onOpenReservation: () => void;
}

export default function PrivateDiningView({ onOpenReservation }: PrivateDiningViewProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Private Celebration / Birthday",
    guests: "12-20 Guests",
    preferredDate: "",
    spacePreference: "Grand Main Saloon",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const eventSpecs = [
    {
      title: "Anniversaries & Celebrations",
      icon: <Users className="w-5 h-5 text-gold-400" />,
      capacity: "Up to 80 seated guests",
      description: "For birthdays, milestone banquets, and family reunions. Custom menu creation with curated musical backings."
    },
    {
      title: "Romantic Proposals",
      icon: <Gem className="w-5 h-5 text-gold-400" />,
      capacity: "Intimate seating (2 guests)",
      description: "A completely private, rose-infused table in our hidden wine cellar under high gothic arches, complete with dedicated server and custom champagne."
    },
    {
      title: "Corporate Dinners & Key Roles",
      icon: <Landmark className="w-5 h-5 text-gold-400" />,
      capacity: "25-45 seated guests",
      description: "Equipped with silent presentation arrays, audio sync, and robust custom chef tasting course structures for corporate relations."
    },
    {
      title: "Movie Shoots & Brand Launches",
      icon: <Film className="w-5 h-5 text-gold-400" />,
      capacity: "Strict capacity upon booking",
      description: "Impeccably beautiful architecture for editorial film, music, cinematic shoots and premium global brand rollouts."
    }
  ];

  const spacesList = [
    {
      name: "Grand Main Dining Saloon",
      capacity: "80 seated / 120 standing",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
      vibe: "Warm clay texture, golden lighting vaults, premium earth weaves."
    },
    {
      name: "Smoked Scent-Leaf Courtyard",
      capacity: "40 seated / 60 standing",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80",
      vibe: "Outdoor firepits, native botanical scents, starlight canopy."
    },
    {
      name: "The Ona Wine Cellar Box",
      capacity: "Up to 14 seated",
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=700&auto=format&fit=crop&q=80",
      vibe: "Underground brick chamber, rare vintages, utmost security."
    }
  ];

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="private-dining-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-16">
      
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block font-light">Bespoke Impressions</span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white leading-tight">
            Celebrate Moments Designed to Leave a Mark
          </h2>
          <p className="text-gray-400 font-sans text-xs sm:text-sm tracking-widest max-w-2xl mx-auto leading-relaxed">
            Curated private dining experiences with lasting impressions. Inspired by 'Ona' — the Edo meaning of a mark or sign — we construct signature moments written in excellence, exceptional flavour, and memorable hospitality.
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-4" />
        </div>
      </section>

      {/* Grid of Event Formats */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {eventSpecs.map((spec, idx) => (
          <div key={idx} className="p-8 bg-white/[0.01] border border-gold-300/10 hover:border-gold-300/30 transition-all duration-300 space-y-4">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-400/10">
              {spec.icon}
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-white font-light">{spec.title}</h3>
              <p className="font-sans text-xs text-gold-400 uppercase tracking-widest font-semibold">{spec.capacity}</p>
              <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">{spec.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Gallery of Spaces with capacities */}
      <section className="bg-[#0a0a0a] border-y border-gold-300/10 py-16 md:py-24 mb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="text-center space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">Our Sanctums</span>
            <h3 className="font-serif text-3xl font-light text-white">Bespoke Architectural Chambers</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {spacesList.map((space, idx) => (
              <div key={idx} className="bg-black/40 border border-[#1b1b1b] overflow-hidden group">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-sans text-[10px] uppercase font-bold tracking-widest bg-gold-500 text-black px-3 py-1">
                    {space.capacity}
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <h4 className="font-serif text-xl text-white font-light">{space.name}</h4>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed font-light">{space.vibe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Inquiry Form */}
      <section id="event-inquiry-section" className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="border border-gold-300/15 p-8 md:p-12 bg-[#0c0c0c] text-left space-y-8 luxury-glow relative">
          <div className="absolute top-0 right-10 w-32 h-32 bg-gold-500/5 rounded-full blur-[60px]" />
          
          <div className="space-y-2 text-center">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-400 font-medium block">Initiate Your Legacy Event</span>
            <h3 className="font-serif text-3xl font-light text-[#fbf9f4]">Private Inquiry Port</h3>
            <div className="w-12 h-px bg-gold-400/50 mx-auto mt-2" />
          </div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                onSubmit={handleFormSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Your Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g. Chief Olumide"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Contact Email</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="E.g. contact@domain.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Phone Number (WhatsApp Direct)</label>
                    <input
                      required
                      type="tel"
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="E.g. +234 803..."
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Preferred Event Date</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Event Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Event Typology</label>
                    <select
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    >
                      <option value="Private Celebration / Birthday">Birthday / Anniversary Suite</option>
                      <option value="Romantic Proposal Package">Marriage Proposal Ritual</option>
                      <option value="Corporate Hosting Session">Corporate Hosting Board</option>
                      <option value="Movie Shoots & Brand Launches">Movie / Brand Media Session</option>
                      <option value="Movie Shoots & Brand Launches">Bespoke Curated Tastings</option>
                    </select>
                  </div>

                  {/* Space Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Sanctum Chamber Preference</label>
                    <select
                      className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.spacePreference}
                      onChange={(e) => setFormData({ ...formData, spacePreference: e.target.value })}
                    >
                      <option value="Grand Main Saloon">Grand Main Dining Saloon</option>
                      <option value="Smoked Scent-Leaf Courtyard">Smoked Scent-Leaf Courtyard (Al Fresco)</option>
                      <option value="The Ona Wine Cellar Box">The Ona Wine Cellar Box</option>
                    </select>
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400">Describe Your vision & Menu Needs</label>
                  <textarea
                    rows={4}
                    className="w-full bg-[#141414] border border-white/5 px-3 py-2.5 text-sm text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide vision details, special visual layout, number of courses, or kids accommodations needed..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-4 px-6 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Private Enquiry</span>
                </button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-gold-400/10 border border-gold-400/20 text-gold-400 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-2xl text-white font-light">Enquiry Safely Transmitted</h4>
                  <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Greetings, <span className="text-gold-300">{formData.name}</span>. Your vision details has been compiled. A Dedicated Ona Private Events Hostess will reach out via phone (<span className="text-gold-300">{formData.phone}</span>) or email within 2 hours.
                  </p>
                </div>
                <div className="text-xs text-gray-500 font-sans border border-white/5 bg-[#141414] p-4 text-left space-y-1 w-full max-w-md">
                  <p><span className="text-gold-400">Client:</span> {formData.name}</p>
                  <p><span className="text-gold-400">Event Typology:</span> {formData.eventType}</p>
                  <p><span className="text-[#c5842b]">Target Date:</span> {formData.preferredDate}</p>
                  <p><span className="text-[#c5842b]">Enquiry ID:</span> ONA-EV-{Math.floor(Math.random() * 8999) + 1000}</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 border border-white/10 hover:border-gold-400 text-xs font-sans uppercase tracking-widest text-[#fbf9f4] transition-colors"
                >
                  Edit Enquiry Specs
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
