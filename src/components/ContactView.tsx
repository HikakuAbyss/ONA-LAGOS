import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OPENING_HOURS } from "../types";
import { Phone, Mail, MapPin, Instagram, MessageSquare, Compass, Send, CheckCircle } from "lucide-react";

interface ContactViewProps {
  onOpenReservation: () => void;
}

export default function ContactView({ onOpenReservation }: ContactViewProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Table Enquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const contactInfos = [
    {
      title: "Direct Voice Gate",
      icon: <Phone className="w-5 h-5 text-gold-400" />,
      detail: "+234 (0) 90 ONA LAGOS",
      subDetail: "Available Tuesdays - Sundays",
      href: "tel:+2348000ONALAGOS"
    },
    {
      title: "Concierge Email",
      icon: <Mail className="w-5 h-5 text-gold-400" />,
      detail: "concierge@onalagos.com",
      subDetail: "Event & general curation questions",
      href: "mailto:concierge@onalagos.com"
    },
    {
      title: "WhatsApp Direct Connection",
      icon: <MessageSquare className="w-5 h-5 text-gold-400" />,
      detail: "+234 90 6000 ONA",
      subDetail: "Instant chat connection to Hostess",
      href: "https://wa.me/2349060000000?text=Hello%20Ona%20Lagos%2C%20I'd%20like%20to%20curate%20a%20table%2C%20please."
    },
    {
      title: "Cultural Chronicles",
      icon: <Instagram className="w-5 h-5 text-gold-400" />,
      detail: "@ona_lagos",
      subDetail: "Follow our culinary mark of culture",
      href: "https://instagram.com/ona_lagos"
    }
  ];

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="contact-and-hours-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-16">
      
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block font-light">Location & Salon Ports</span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white leading-tight">
            Connect & Visit Us
          </h2>
          <p className="text-gray-400 font-sans text-xs sm:text-sm tracking-widest max-w-xl mx-auto leading-relaxed">
            Plot 14, Ademola Adetokunbo Street, Victoria Island, Lagos. Guided by warmth & modern African luxury.
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-4" />
        </div>
      </section>

      {/* Grid: Contact Cards & Opening Hours */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-8">
        
        {/* Contact info grid (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">Instant Gateways</span>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-light">Direct Concierge Channels</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {contactInfos.map((info, idx) => (
              <a
                href={info.href}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                className="p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-gold-400/20 transition-all duration-300 flex gap-4 items-start group"
              >
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-400/10 shrink-0 group-hover:bg-gold-500/20 transition-colors">
                  {info.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg text-white font-light group-hover:text-gold-300 transition-colors">{info.title}</h4>
                  <p className="font-sans text-sm text-gold-400/90 font-medium tracking-wide">{info.detail}</p>
                  <p className="font-sans text-xs text-gray-500 font-light">{info.subDetail}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Opening Hours list & Book Table card (7 cols) */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-gold-300/15 p-6 md:p-10 space-y-8 luxury-glow">
          <div className="space-y-2 border-b border-white/5 pb-4">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-400 block">The Salon Rhythm</span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-white">Opening & Dining Hours</h3>
          </div>

          <div className="divide-y divide-white/5 space-y-4">
            {OPENING_HOURS.map((hours, idx) => (
              <div key={idx} className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 first:pt-0">
                <span className="font-serif text-lg text-white font-light">{hours.day}</span>
                <div className="text-right flex flex-col sm:items-end font-sans text-xs text-gray-400 space-y-0.5 font-light">
                  {hours.lunch !== "Closed" ? (
                    <>
                      <span>LUNCH: {hours.lunch}</span>
                      <span className="text-gold-400/80">DINNER: {hours.dinner}</span>
                    </>
                  ) : (
                    <span className="text-[#aa6721] uppercase tracking-wider"> {hours.dinner} </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 text-center space-y-4">
            <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
              We recommend reserving tables at least 48 hours in advance for prime dining slots, especially on Sunday Roast and weekend dining cycles.
            </p>
            <button
              onClick={onOpenReservation}
              className="cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3.5 px-10 w-full sm:w-auto inline-block"
            >
              Secure Table Placement
            </button>
          </div>
        </div>
      </section>

      {/* Styled Location Map & Message Form split */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Styled Visual Coordinates Map */}
        <div className="space-y-6 relative">
          <div className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">Navigational Coordinates</span>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-light">Interactive Location Compass</h3>
          </div>

          {/* Map display box */}
          <div className="bg-[#0e0e0e] border border-gold-400/10 p-6 space-y-6 relative overflow-hidden luxury-glow">
            {/* Ambient gold scan line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent animate-pulse" />
            
            <div className="aspect-[16/9] bg-black relative flex flex-col justify-between p-6 border border-white/5 overflow-hidden">
              {/* Fake compass lines / Grid coordinates */}
              <div className="absolute inset-0 opacity-10 flex flex-col justify-between py-6 px-12 pointer-events-none">
                <div className="flex justify-between border-b border-gray-500 pb-2 text-[10px] font-mono">
                  <span>6°25'49&quot;N</span>
                  <span>3°26'12&quot;E</span>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-gray-500 via-transparent to-gray-500 mx-auto" strokeDasharray="4" />
                <div className="flex justify-between border-t border-gray-500 pt-2 text-[10px] font-mono">
                  <span>LAT INDEX: 6.43</span>
                  <span>LONG INDEX: 3.43</span>
                </div>
              </div>

              {/* Central Radar Circle Pulsing */}
              <div className="absolute top-1/2 left-1/2 translate-y-[-50%] translate-x-[-50%] flex flex-col items-center">
                <span className="relative flex h-8 w-8 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500 shadow-[0_0_10px_rgb(181,137,75)]"></span>
                </span>
                <span className="font-serif text-sm text-[#fbf9f4] tracking-widest font-light mt-2 bg-black/90 border border-gold-400/15 py-1 px-3">
                  ONA LAGOS
                </span>
              </div>

              {/* Coordinates info overlay */}
              <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#aa6721] bg-black/80 px-2 py-1">
                PLOT 14, ADEMOLA ADETOKUNBO, VI
              </div>

              {/* Compass icon corner */}
              <div className="absolute top-4 right-4">
                <Compass className="w-5 h-5 text-gold-400/40 animate-spin" style={{ animationDuration: "10s" }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-white font-light">Getting to Victoria Island</h4>
                <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
                  We are conveniently situated in Victoria Island, the vibrant heartbeat of Lagos. We support direct premium valet parking for all our dining guests.
                </p>
              </div>

              <a
                href="https://maps.google.com/?q=Plot+14,+Ademola+Adetokunbo+Street,+Victoria+Island,+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer bg-transparent hover:bg-gold-500/10 border border-gold-400 text-gold-300 font-sans text-xs uppercase tracking-widest py-3 px-6 transition-colors"
              >
                Launch Live Map Navigator
              </a>
            </div>
          </div>
        </div>

        {/* Quick Question / Messages Form */}
        <div id="general-contact-frame" className="space-y-6">
          <div className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-400 font-light block">Bespoke Inquiries</span>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-light">Whisper to the House</h3>
          </div>

          <div className="bg-[#0e0e0e] border border-[#1d1d1d] p-6 md:p-8 space-y-6">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  onSubmit={handleFormSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-gray-400">Name</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-black border border-white/5 px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-gray-400">Email</label>
                      <input
                        required
                        type="email"
                        className="w-full bg-black border border-white/5 px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject select */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Topic of Interest</label>
                    <select
                      className="w-full bg-black border border-white/5 px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Table Enquiry">Bespoke Dinner reservation question</option>
                      <option value="Press / Media">Press, Brand, or Film shoots</option>
                      <option value="Career placements">Join our culinary team</option>
                      <option value="General feedback">Leave general feedback</option>
                    </select>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400">Message Body</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-black border border-white/5 px-3 py-2 text-sm text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message details..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Message</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 text-center space-y-4 flex flex-col items-center justify-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl font-light text-white">Message Safely Logged</h4>
                  <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="text-gold-300">{formData.name}</span>. Your message about "{formData.subject}" has been delivered to Ona's administrative suite. We strive to reply within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs uppercase font-sans tracking-widest text-gold-300 underline pt-2"
                  >
                    Send another query
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
}
