import { useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GALLERY_ITEMS, GalleryItem } from "../types";
import { Maximize2, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export default function GalleryView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>(GALLERY_ITEMS);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        const snap = await getDocs(collection(db, "gallery_items"));
        if (!snap.empty) {
          const list: GalleryItem[] = [];
          snap.forEach(doc => {
            list.push(doc.data() as GalleryItem);
          });
          setGallery(list);
        }
      } catch (e) {
        console.warn("Could not query dynamic gallery from Firestore:", e);
      }
    };
    fetchGallery();
  }, []);

  const categories = [
    { id: "all", label: "All Spheres" },
    { id: "food", label: "Gastronomy" },
    { id: "drinks", label: "Cellar & Shaker" },
    { id: "interior", label: "L'intérieur" },
    { id: "outdoor", label: "Courtyard" },
    { id: "guests", label: "Our Guests" },
    { id: "events", label: "Curation Events" },
    { id: "chef", label: "The Chefs" }
  ];

  const filteredPhotos = gallery.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    if (activePhoto === null) return;
    const nextIdx = (activePhoto + 1) % filteredPhotos.length;
    setActivePhoto(nextIdx);
  };

  const handlePrev = (e: MouseEvent) => {
    e.stopPropagation();
    if (activePhoto === null) return;
    const prevIdx = (activePhoto - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(prevIdx);
  };

  return (
    <div id="immersive-gallery-view" className="bg-[#050505] text-[#fbf9f4] pt-28 pb-16 min-h-screen">
      
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-400 block font-light">Visual Archives</span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white leading-tight">
            Cinematic Immersive Gallery
          </h2>
          <p className="text-gray-400 font-sans text-xs sm:text-sm tracking-widest max-w-xl mx-auto leading-relaxed">
            A window into the culinary rhythm, tactile clays, and laughing souls of Ona Lagos.
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto mt-4" />
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-wrap gap-2 justify-center border-b border-white/5 pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-[10px] font-sans uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.id
                  ? "text-gold-300 border-b-2 border-gold-400 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry-Style Beautiful Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                key={photo.id}
                onClick={() => setActivePhoto(index)}
                className="relative overflow-hidden group cursor-pointer aspect-[4/3] bg-neutral-900 border border-white/5"
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Immersive overlay hover */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 scale-90 group-hover:scale-100 transition-all duration-300">
                      <Eye className="w-4 h-4 text-gold-300" />
                    </div>
                  </div>

                  <div className="space-y-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-gold-400">
                      {photo.category}
                    </p>
                    <h4 className="font-serif text-lg text-white font-light">
                      {photo.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePhoto(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous slide control */}
            <button
              onClick={handlePrev}
              className="absolute left-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 border border-white/5"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Active Image block */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative max-w-4xl max-h-[75vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredPhotos[activePhoto].image}
                alt={filteredPhotos[activePhoto].title}
                className="max-w-full max-h-[70ch] object-contain border border-gold-300/10"
                referrerPolicy="no-referrer"
              />

              {/* Informative footer */}
              <div className="absolute -bottom-12 left-0 right-0 text-center space-y-1">
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#d5a142]">
                  {filteredPhotos[activePhoto].category} — Image {activePhoto + 1} of {filteredPhotos.length}
                </p>
                <h4 className="subtitle font-serif text-lg text-white font-light">
                  {filteredPhotos[activePhoto].title}
                </h4>
              </div>
            </motion.div>

            {/* Next slide control */}
            <button
              onClick={handleNext}
              className="absolute right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 border border-white/5"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
