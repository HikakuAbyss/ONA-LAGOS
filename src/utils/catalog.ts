import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { MENU_ITEMS, GALLERY_ITEMS, TESTIMONIALS } from "../types";

export interface FieldDef {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  visibility: "show" | "hide" | "admin_only" | "menu_detail" | "card_view" | "expanded_view";
  adminOnly?: boolean;
}

export interface TableDef {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
}

export interface CatalogData {
  tables: Record<string, TableDef>;
  records: Record<string, Record<string, any>[]>;
}

const DEFAULT_CATALOG: CatalogData = {
  tables: {
    menu_items: {
      id: "menu_items",
      label: "Menu Catalog",
      description: "Main dining experience entrees, starters, and premium selections",
      fields: []
    }
  },
  records: {
    menu_items: MENU_ITEMS,
    gallery: GALLERY_ITEMS,
    testimonials: TESTIMONIALS,
    kids_menu: [
      { id: "k1", name: "Plantain Cheese Skewers", description: "Bite-sized sweet dodo roasted with mild local cheese cubes. 100% spice-free.", price: "₦5,500", image: "https://images.unsplash.com/photo-1566453983492-411db181e194?w=400&q=80" },
      { id: "k2", name: "Mini Grass-Fed Beef Slider", description: "Ona brioche roll, seared local beef patty, cheddar, organic honey-glaze fries.", price: "₦8,000", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" }
    ],
    private_dining_enquiries: [
      { id: "pde1", name: "Tunde Bakare", email: "bakare@tundeglo.com", phone: "+234 803 222 3456", date: "2026-06-15", guests: 12, status: "Confirmed" }
    ],
    contact_messages: [
      { id: "msg1", name: "Simi Solarin", email: "simi.sol@gmail.com", subject: "Reservation proposal inside wine cave", message: "Hello concierge team, I would love to reserve the entire underground vault for a special candlelit anniversary.", status: "Read" }
    ],
    promotions: [
      { id: "CHAMP1", title: "Complimentary Scent-Leaf Champagne Pour", discount: "Free Pour", validUntil: "2026-08-31" }
    ],
    events: [
      { id: "e1", title: "Scent-Leaf Gin Garden Soirée", date: "2026-06-21", time: "17:00", description: "Immersive garden soundscape, dry-aged chops and exclusive palm-wine infusions with live vocal loops." }
    ],
    faqs: [
      { id: "faq1", question: "Is valet service provided?", answer: "Yes, complimentary premium valet service is offered directly at the entrance gate on Victoria Island." }
    ],
    homepage_sections: [
      { id: "ssec_about", title: "High Modern Gastronomy", subtitle: "La Maison Ona", description: "Harvesting rich West African crop diversity, ancestral clay roasts, and secret herbal reductions, presented through a luxury lens.", ctaText: "Our Philosophy", ctaLink: "about" }
    ],
    staff: [
      { id: "stf1", name: "Chef Adeniyi", role: "Executive Master Curator", email: "ade.cuisine@onalagos.com" }
    ]
  }
};

// Retrieve loaded Catalog with quick fallback structures
export function getSavedCatalog(): CatalogData {
  try {
    const cached = localStorage.getItem("ona_mock_content_catalog");
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_CATALOG;
}
