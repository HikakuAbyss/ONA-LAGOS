import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Calendar, Users, Sparkles, User, Phone, Mail, Clock } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
  whatsappNumber?: string;
}

export default function ReservationModal({
  isOpen,
  onClose,
  initialType = "Standard Dining",
  whatsappNumber
}: ReservationModalProps) {
  // 1. Personal Form States
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2 Guests");
  const [experience, setExperience] = useState(() => {
    if (initialType?.includes("Sunday Roast")) return "Sunday Roast";
    if (initialType?.includes("Private") || initialType?.includes("Birthday") || initialType?.includes("Event")) return "Private Event";
    if (initialType?.includes("Lunch")) return "Lunch";
    return "Dinner";
  });
  const [occasion, setOccasion] = useState("Birthday");
  const [specialRequest, setSpecialRequest] = useState("");
  const [step, setStep] = useState(1);
  const [waRedirectUrl, setWaRedirectUrl] = useState("");

  // Sync initial type changes
  useEffect(() => {
    if (initialType?.includes("Sunday Roast")) setExperience("Sunday Roast");
    else if (initialType?.includes("Private") || initialType?.includes("Birthday") || initialType?.includes("Event")) setExperience("Private Event");
    else if (initialType?.includes("Lunch")) setExperience("Lunch");
    else setExperience("Dinner");
  }, [initialType]);

  // Alphanumeric keypad mapping helper
  const getCleanWhatsAppNumber = (num?: string): string => {
    const fallback = "234906000662"; // Default Ona Lagos host line
    if (!num) return fallback;

    const charMap: { [key: string]: string } = {
      a: "2", b: "2", c: "2",
      d: "3", e: "3", f: "3",
      g: "4", h: "4", i: "4",
      j: "5", k: "5", l: "5",
      m: "6", n: "6", o: "6",
      p: "7", q: "7", r: "7", s: "7",
      t: "8", u: "8", v: "8",
      w: "9", x: "9", y: "9", z: "9"
    };

    let result = "";
    for (let i = 0; i < num.length; i++) {
      const char = num[i].toLowerCase();
      if (charMap[char]) {
        result += charMap[char];
      } else if (/[0-9]/.test(char)) {
        result += char;
      }
    }
    return result || fallback;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 2. Perform validations
    if (!fullName.trim() || !phoneNumber.trim() || !emailAddress.trim() || !date || !time) {
      alert("Please configure all required fields to secure your table curation.");
      return;
    }

    // 3. Pre-format the WhatsApp message
    const formattedMsg = 
`Hello Ona Lagos, I would like to make a reservation.

Name: ${fullName.trim()}
Phone: ${phoneNumber.trim()}
Email: ${emailAddress.trim()}
Date: ${date}
Time: ${time}
Number of Guests: ${guests}
Dining Preference: ${experience}
Occasion: ${occasion}
Special Request / Dietary Requirement: ${specialRequest.trim() || "None"}

Thank you.`;

    const targetDigits = getCleanWhatsAppNumber(whatsappNumber);
    const waUrl = `https://wa.me/${targetDigits}?text=${encodeURIComponent(formattedMsg)}`;
    setWaRedirectUrl(waUrl);
    setStep(2);

    // 4. Automatically trigger redirection in same tab to prevent popup blocking
    setTimeout(() => {
      window.location.href = waUrl;
    }, 2000);
  };

  const resetModal = () => {
    setStep(1);
    setFullName("");
    setPhoneNumber("");
    setEmailAddress("");
    setDate("");
    setTime("");
    setGuests("2 Guests");
    setExperience("Dinner");
    setOccasion("Birthday");
    setSpecialRequest("");
    setWaRedirectUrl("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="reservation-coordinator-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          {/* Backdrop trigger */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            id="reservation-panel"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.55 }}
            className="relative w-full max-w-xl my-8 overflow-hidden rounded-none border border-gold-400/20 bg-[#070707] text-[#fbf9f4] shadow-[0_24px_50px_rgba(0,0,0,0.9)] z-10"
          >
            {/* Elegant Header Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold-400/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-500 hover:text-gold-300 transition-colors z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                <div className="space-y-1">
                  <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-gold-400 font-light">On-Site Dining Placement</p>
                  <h3 className="font-serif text-2xl md:text-3xl font-light text-[#fbf9f4] tracking-wide">
                    Initiate Your Reservation
                  </h3>
                  <div className="w-10 h-px bg-gold-400/40 mt-2" />
                </div>

                <div className="space-y-4">
                  {/* Grid 1: Personal Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <User className="w-3 h-3 text-gold-400/70" /> Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="E.g. Adeleke Cole"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors placeholder:text-gray-600 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <Phone className="w-3 h-3 text-gold-400/70" /> Phone Number *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="E.g. +234 901 234 5678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors placeholder:text-gray-600 font-sans"
                      />
                    </div>
                  </div>

                  {/* Field 3: Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                      <Mail className="w-3 h-3 text-gold-400/70" /> Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="E.g. concierge@onalagos.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors placeholder:text-gray-600 font-sans"
                    />
                  </div>

                  {/* Grid 2: Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <Calendar className="w-3 h-3 text-gold-400/70" /> Preferred Date *
                      </label>
                      <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors font-sans [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <Clock className="w-3 h-3 text-gold-400/70" /> Preferred Time *
                      </label>
                      <input
                        required
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors font-sans [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Grid 3: Guests & Dining Preference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <Users className="w-3.5 h-3.5 text-gold-400/70" /> Number of Guests *
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors font-sans"
                      >
                        {Array.from({ length: 12 }, (_, i) => `${i + 1} Guest${i > 0 ? "s" : ""}`).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                        <option value="13+ Guests (Private Event)">13+ Guests (Private Event)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-sans font-light">
                        <Sparkles className="w-3.5 h-3.5 text-gold-400/70" /> Dining Preference *
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-none px-3 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors font-sans"
                      >
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Sunday Roast">Sunday Roast</option>
                        <option value="Private Event">Private Event</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid 4: Occasion */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-light">Occasion *</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-none px-3 py-2.5 text-xs text-[#fbf9f4] focus:outline-none focus:border-gold-400 transition-colors font-sans"
                    >
                      <option value="Birthday">Birthday Celebration</option>
                      <option value="Anniversary">Anniversary Tribute</option>
                      <option value="Date Night">Romantic Date Night</option>
                      <option value="Business">Business Engagement</option>
                      <option value="Other">Other Dining Ritual</option>
                    </select>
                  </div>

                  {/* Field 9: Dietary & Special Request */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-light">
                      Special Request or Dietary Requirements
                    </label>
                    <textarea
                      rows={2}
                      placeholder="E.g. Nut allergies, shell-fish gluten restrictions, private booth request, table setups..."
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-none px-3.5 py-2 text-xs text-[#fbf9f4] placeholder:text-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none font-sans"
                    />
                  </div>
                </div>

                {/* Submit action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full cursor-pointer bg-gold-500 hover:bg-gold-600 border border-gold-400/20 text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Secure Booking via WhatsApp</span>
                  </button>
                </div>

                <p className="text-[9px] text-center text-gray-500 font-sans tracking-wide">
                  This secure reservation acts as a live concierge conduit. We do not transmit your data to any third-party platforms.
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
                    className="absolute inset-0 rounded-full border border-gold-400/30"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                  />
                  <Check className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-gold-400 font-light">Curation Verified</p>
                  <h3 className="font-serif text-3xl font-light text-[#fbf9f4] tracking-wide">Securing Hostess Direct Line</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans leading-relaxed">
                    Compiling your table coordinates and initiating secure direct redirection to the Ona Lagos WhatsApp portal...
                  </p>
                </div>

                <div className="py-3 px-4.5 rounded-none bg-[#111111] border border-white/5 max-w-md w-full text-left text-xs font-sans space-y-1.5 text-gray-300">
                  <p><span className="text-gold-400/80 font-medium">Guest Name:</span> {fullName}</p>
                  <p><span className="text-gold-400/80 font-medium">Preferred Slot:</span> {date} at {time}</p>
                  <p><span className="text-gold-400/80 font-medium">Diners & Occasion:</span> {guests} ({occasion})</p>
                  <p><span className="text-gold-400/80 font-medium">Preference:</span> {experience}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={waRedirectUrl}
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-black text-xs font-sans uppercase tracking-widest font-semibold flex items-center justify-center"
                  >
                    Open WhatsApp Manually
                  </a>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-6 py-2.5 border border-white/10 hover:border-gold-400 text-xs font-sans uppercase tracking-widest text-gray-400 hover:text-[#fbf9f4] transition-colors"
                  >
                    Return to Lounge
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
