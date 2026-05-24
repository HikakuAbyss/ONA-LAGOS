import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Calendar, Users, Sparkles, MapPin, Minimize2 } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

export default function ReservationModal({ isOpen, onClose, initialType = "Standard Dining" }: ReservationModalProps) {
  const [guests, setGuests] = useState("2 Guests");
  const [kids, setKids] = useState("0 Children");
  const [experience, setExperience] = useState(initialType === "Sunday Roast & Brunch" ? "Sunday Roast" : initialType);
  const [seating, setSeating] = useState("Main Dining Saloon");
  const [occasion, setOccasion] = useState("Standard Dining");
  const [dietary, setDietary] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);

    // Build query parameters to carry user selections to reserve.onalagos.com
    const params = new URLSearchParams({
      guests,
      kids,
      experience,
      seating,
      occasion,
      dietary,
      specialRequest
    });
    
    // Simulate redirection after displaying elegance
    setTimeout(() => {
      window.open(`https://reserve.onalagos.com?${params.toString()}`, "_blank", "noopener,noreferrer");
    }, 1800);
  };

  const resetModal = () => {
    setStep(1);
    setGuests("2 Guests");
    setKids("0 Children");
    setExperience("Standard Dining");
    setSeating("Main Dining Saloon");
    setOccasion("Standard Dining");
    setDietary("");
    setSpecialRequest("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="reservation-coordinator-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop trigger */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            id="reservation-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-xl overflow-hidden rounded-none border border-gold-300/20 bg-[#0c0c0c] text-[#fbf9f4] luxury-glow"
          >
            {/* Elegant Header Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold-400/10 rounded-full blur-[80px]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gold-300 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold-400">Personalized Curation</p>
                  <h3 className="font-serif text-2xl md:text-3xl font-light text-[#fbf9f4]">
                    Configure Your Dining Experience
                  </h3>
                  <div className="w-12 h-px bg-gold-400/50 mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Guests */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gold-400" /> Co-Diners
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      {Array.from({ length: 12 }, (_, i) => `${i + 1} Guest${i > 0 ? "s" : ""}`).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      <option value="13+ Guests (Private dining)">13+ Guests (Private Room)</option>
                    </select>
                  </div>

                  {/* Select Kids - Highlights family friendliness */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Kids / High-Chairs
                    </label>
                    <select
                      value={kids}
                      onChange={(e) => setKids(e.target.value)}
                      className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="0 Children">No children accompanying</option>
                      <option value="1 Child (Standard Chair)">1 Child (Standard)</option>
                      <option value="1 Child (High-Chair required)">1 Child (Requires High-Chair)</option>
                      <option value="2 Children (High-Chairs required)">2 Children (Requires High-Chairs)</option>
                      <option value="3+ Children (Family Suite)">3+ Children (Family setup)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Seating Preference */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" /> Seating Saloon
                    </label>
                    <select
                      value={seating}
                      onChange={(e) => setSeating(e.target.value)}
                      className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="Main Dining Saloon">Grand Main Dining Saloon</option>
                      <option value="Smoked Scent Leaf Courtyard (Outdoor)">Smoked Scent Leaf Courtyard (Al Fresco)</option>
                      <option value="Ona Private Cellar Lounge">Ona Private Wine Cellar lounge</option>
                      <option value="Chef's Counter (Live Plating)">Chef's Counter (Interactive view)</option>
                    </select>
                  </div>

                  {/* Dining Occasion / Experience Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" /> Journey Style
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2 text-sm text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="Standard Dining">Gourmet Dinner</option>
                      <option value="Sunday Roast">Sunday Roast Only</option>
                      <option value="Chef's Multi-Course Tasting Menu">Chef's Multi-Course Tasting</option>
                      <option value="Private Celebration / Birthday">Private Celebration / Birthday</option>
                      <option value="Romantic Proposal Package">Romantic Marriage Proposal</option>
                      <option value="Corporate Hosting Session">Corporate Hosting Session</option>
                    </select>
                  </div>
                </div>

                {/* Dietary Requirement */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400">
                    Dietary Requirements & Spice Allergies
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Mild spice preference for children, Nut allergies, shell-fish gluten restrictions..."
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2.5 text-sm text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <p className="text-[10px] text-gold-400/60 font-sans italic">
                    Chef carefully adjusts West African pepper levels for younger guests and specific allergies.
                  </p>
                </div>

                {/* Accompanied note */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400">
                    Host Instructions & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Celebrating our 10th anniversary, or request private dining booth configuration..."
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className="w-full bg-[#141414] border border-white/5 rounded-none px-3 py-2.5 text-sm text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                  />
                </div>

                {/* Submit action */}
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/30 text-black font-sans text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-6 transition-all duration-300 relative group flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">Proceed to Ona Reserve Gate</span>
                </button>

                <p className="text-[10px] text-center text-gray-500 font-sans">
                  The reservation will open securely with your customized configuration on our external host gate <span className="text-gold-400/80">reserve.onalagos.com</span>.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[460px]"
              >
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-400/20 text-gold-400 mb-2 relative">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-gold-400/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold-400">Profile Compiled</p>
                  <h3 className="font-serif text-3xl font-light text-[#fbf9f4]">Whispering to the Hostess</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Transferring your customized plan to our booking system. We are opening our reservation gateway...
                  </p>
                </div>

                <div className="py-2 px-4 rounded-none bg-[#141414] border border-white/5 max-w-md w-full text-left text-xs font-sans space-y-1.5 text-gray-300">
                  <p><span className="text-gold-400">Diners:</span> {guests} ({kids})</p>
                  <p><span className="text-gold-400">Experience:</span> {experience}</p>
                  <p><span className="text-gold-400">Saloon:</span> {seating}</p>
                  {occasion !== "Standard Dining" && <p><span className="text-gold-400">Occasion:</span> {occasion}</p>}
                  {dietary && <p className="truncate"><span className="text-gold-400">Dietary:</span> {dietary}</p>}
                </div>

                <button
                  type="button"
                  onClick={resetModal}
                  className="px-6 py-2 border border-white/10 hover:border-gold-400 text-xs font-sans uppercase tracking-widest text-gray-300 hover:text-[#fbf9f4] transition-colors"
                >
                  Return to Lounge
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
