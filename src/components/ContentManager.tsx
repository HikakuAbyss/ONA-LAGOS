import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  Search,
  X,
  PlusCircle,
  Eye,
  Info,
  Layers,
  Table,
  Columns,
  FileText,
  Copy,
  Save,
  Globe,
  RefreshCw,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  EyeOff,
  Filter,
  CheckSquare,
  Sparkles,
  Lock,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Grid
} from "lucide-react";
// Convex Hooks & API
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { convexClient } from "../convexClient";
import { MENU_ITEMS, GALLERY_ITEMS, TESTIMONIALS } from "../types";

// Standard Field definition interface
export interface FieldDef {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "price" | "date" | "time" | "select" | "toggle" | "image" | "file" | "url" | "color" | "status";
  options?: string[];
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  visibility: "show" | "hide" | "admin_only" | "menu_detail" | "card_view" | "expanded_view";
  adminOnly?: boolean;
}

// Table Definition
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

// Seed Initial Content Catalog
const DEFAULT_TABLE_DEFS: Record<string, TableDef> = {
  menu_items: {
    id: "menu_items",
    label: "Menu Catalog",
    description: "Main dining experience entrees, starters, and premium selections",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Dish Name", type: "text", required: true, visibility: "show" },
      { id: "description", label: "Description", type: "textarea", required: true, visibility: "show" },
      { id: "price", label: "Price", type: "price", required: true, visibility: "show" },
      { id: "categories", label: "Categories", type: "text", required: true, visibility: "show" },
      { id: "image", label: "Image (URL)", type: "image", required: true, visibility: "show" },
      { id: "isVegetarian", label: "Vegetarian Tag", type: "toggle", required: false, defaultValue: false, visibility: "show" },
      { id: "isKidsFriendly", label: "Kids Friendly Tag", type: "toggle", required: false, defaultValue: false, visibility: "show" },
      { id: "isSpicy", label: "Spicy Tag", type: "toggle", required: false, defaultValue: false, visibility: "show" },
      { id: "isMild", label: "Mild Tag", type: "toggle", required: false, defaultValue: false, visibility: "show" }
    ]
  },
  kids_menu: {
    id: "kids_menu",
    label: "Kids Menu",
    description: "Pediatric selections formulated without heavy peppers or spices",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Item Name", type: "text", required: true, visibility: "show" },
      { id: "description", label: "Description", type: "textarea", required: true, visibility: "show" },
      { id: "price", label: "Price", type: "price", required: true, visibility: "show" },
      { id: "image", label: "Image (URL)", type: "image", required: true, visibility: "show" }
    ]
  },
  gallery: {
    id: "gallery",
    label: "Gallery Highlights",
    description: "Images capturing high modern gastronomy, saloon architectural structures, and guest dining moments",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "title", label: "Title", type: "text", required: true, visibility: "show" },
      { id: "category", label: "Category", type: "select", options: ["food", "drinks", "interior", "outdoor", "guests", "events", "chef"], required: true, visibility: "show" },
      { id: "image", label: "Image (URL)", type: "image", required: true, visibility: "show" }
    ]
  },
  private_dining_enquiries: {
    id: "private_dining_enquiries",
    label: "Private Dining Enquiries",
    description: "Customer requests for birthday setups, candlelit cellars, and family banquets",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Client Name", type: "text", required: true, visibility: "show" },
      { id: "email", label: "Email Address", type: "text", required: true, visibility: "show" },
      { id: "phone", label: "Contact Phone", type: "text", required: true, visibility: "show" },
      { id: "date", label: "Requested Date", type: "date", required: true, visibility: "show" },
      { id: "guests", label: "Number of Guests", type: "number", required: true, visibility: "show" },
      { id: "status", label: "Enquiry Status", type: "status", options: ["Pending", "Contacted", "Confirmed", "Cancelled"], required: true, defaultValue: "Pending", visibility: "show" }
    ]
  },
  contact_messages: {
    id: "contact_messages",
    label: "Contact Inbox Messages",
    description: "General feedback and customer inquiries sent via public footer pathways",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Sender Name", type: "text", required: true, visibility: "show" },
      { id: "email", label: "Sender Email", type: "text", required: true, visibility: "show" },
      { id: "subject", label: "Subject Line", type: "text", required: true, visibility: "show" },
      { id: "message", label: "Message Body", type: "textarea", required: true, visibility: "show" },
      { id: "status", label: "Status", type: "status", options: ["Unread", "Read", "Replied"], required: true, defaultValue: "Unread", visibility: "show" }
    ]
  },
  testimonials: {
    id: "testimonials",
    label: "Patron Testimonials",
    description: "Guest appreciate notes, celebrity quotes, and critic reviews",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Patron Name", type: "text", required: true, visibility: "show" },
      { id: "role", label: "Designation / Role", type: "text", required: true, visibility: "show" },
      { id: "comment", label: "Testimonial Comment", type: "textarea", required: true, visibility: "show" },
      { id: "rating", label: "Rating Stars", type: "number", required: true, defaultValue: 5, visibility: "show" }
    ]
  },
  homepage_sections: {
    id: "homepage_sections",
    label: "Homepage Editorial Sections",
    description: "Dynamic landing segments representing La Maison segments, Sunday Brunch, etc.",
    fields: [
      { id: "id", label: "Section Key", type: "text", required: true, visibility: "admin_only" },
      { id: "title", label: "Headline Title", type: "text", required: true, visibility: "show" },
      { id: "subtitle", label: "Upper Tagline", type: "text", required: false, visibility: "show" },
      { id: "description", label: "Editorial Copy", type: "textarea", required: true, visibility: "show" },
      { id: "image", label: "Image (URL)", type: "image", required: false, visibility: "show" },
      { id: "ctaText", label: "Action Button Text", type: "text", required: false, visibility: "show" },
      { id: "ctaLink", label: "Action Navigation Link", type: "text", required: false, visibility: "show" }
    ]
  },
  promotions: {
    id: "promotions",
    label: "Promotional Banner Ads",
    description: "Holiday announcements, happy-hour specials, and champagne codes",
    fields: [
      { id: "id", label: "Promo Code", type: "text", required: true, visibility: "show" },
      { id: "title", label: "Promo Description", type: "text", required: true, visibility: "show" },
      { id: "discount", label: "Discount %", type: "text", required: true, visibility: "show" },
      { id: "validUntil", label: "Expiry Date", type: "date", required: true, visibility: "show" }
    ]
  },
  events: {
    id: "events",
    label: "Masterful Events & Dinners",
    description: "Live afro-jazz brunch dates and elite tasting curator calendars",
    fields: [
      { id: "id", label: "ID", type: "text", required: true, visibility: "admin_only" },
      { id: "title", label: "Event Name", type: "text", required: true, visibility: "show" },
      { id: "date", label: "Calendar Date", type: "date", required: true, visibility: "show" },
      { id: "time", label: "Event Hour", type: "time", required: true, visibility: "show" },
      { id: "description", label: "About Event", type: "textarea", required: true, visibility: "show" }
    ]
  },
  staff: {
    id: "staff",
    label: "Operational Staff Members",
    description: "Epitome-of-hospitality service hosts, sommeliers, and kitchen curators",
    fields: [
      { id: "id", label: "Staff ID", type: "text", required: true, visibility: "admin_only" },
      { id: "name", label: "Full Name", type: "text", required: true, visibility: "show" },
      { id: "role", label: "Position Staff", type: "text", required: true, visibility: "show" },
      { id: "email", label: "Email Node", type: "text", required: false, visibility: "show" }
    ]
  },
  faqs: {
    id: "faqs",
    label: "Frequent Enquiries (FAQs)",
    description: "Dynamic informational segments covering dress-codes, valets, and closures",
    fields: [
      { id: "id", label: "FAQ ID", type: "text", required: true, visibility: "admin_only" },
      { id: "question", label: "Customer Query", type: "text", required: true, visibility: "show" },
      { id: "answer", label: "Official Explanation", type: "textarea", required: true, visibility: "show" }
    ]
  }
};

const SEED_RECORDS: Record<string, any[]> = {
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
};

export default function ContentManager({ currentUser }: { currentUser: any }) {
  // Convex Hooks
  const convexCatalogDraft = useQuery(api.settings.getByKey, { key: "content_catalog_draft" });
  const setSetting = useMutation(api.settings.setByKey);

  const [catalog, setCatalog] = useState<CatalogData>({
    tables: DEFAULT_TABLE_DEFS,
    records: SEED_RECORDS
  });
  
  const [activeTableKey, setActiveTableKey] = useState<string>("menu_items");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Success and failure triggers
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Draft vs Published tracks
  const [draftCatalog, setDraftCatalog] = useState<CatalogData | null>(null);
  const [publishedBackup, setPublishedBackup] = useState<CatalogData | null>(null);
  const [isModified, setIsModified] = useState(false);

  // Selection tools for Bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Field Editor Modals
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [isEditRowOpen, setIsEditRowOpen] = useState(false);
  
  // Modal Payload States
  const [newColumn, setNewColumn] = useState<FieldDef>({
    id: "",
    label: "",
    type: "text",
    required: false,
    defaultValue: "",
    placeholder: "",
    helpText: "",
    visibility: "show"
  });
  const [newColumnOptionsString, setNewColumnOptionsString] = useState("");

  const [activeEditRowIndex, setActiveEditRowIndex] = useState<number | null>(null);
  const [rowFormPayload, setRowFormPayload] = useState<Record<string, any>>({});
  
  const isSuperAdmin = currentUser?.role === "Super Admin" || currentUser?.email === "officialdananj@gmail.com";
  const isAdmin = isSuperAdmin || currentUser?.role === "Admin" || currentUser?.role === "Manager";

  const [globalPreviewMode, setGlobalPreviewMode] = useState<"published" | "draft">(() => {
    const saved = localStorage.getItem("ona_preview_mode");
    return (saved === "draft" || saved === "published") ? saved : "draft";
  });

  const handleTogglePreviewMode = (mode: "published" | "draft") => {
    localStorage.setItem("ona_preview_mode", mode);
    setGlobalPreviewMode(mode);
    window.dispatchEvent(new Event("ona_preview_mode_changed"));
    triggerStatus(`Preview target switched to: ${mode === 'draft' ? 'Draft (Real-time Preview)' : 'Production (Live Published)'}`);
  };

  // Temporary local uploads simulated state
  const [fieldUploadProgress, setFieldUploadProgress] = useState<Record<string, number>>({});

  // Real-time Convex sync setup
  useEffect(() => {
    if (convexCatalogDraft) {
      if (convexCatalogDraft.success && convexCatalogDraft.data) {
        const data = convexCatalogDraft.data as CatalogData;
        setCatalog(data);
        setDraftCatalog(data);
      } else {
        // Fallback or seed draft document
        const initialCatalog = { tables: DEFAULT_TABLE_DEFS, records: SEED_RECORDS };
        setCatalog(initialCatalog);
        setDraftCatalog(initialCatalog);
      }
      setLoading(false);
    }
  }, [convexCatalogDraft]);

  // Sync published backup on mount
  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const res = await convexClient.query(api.settings.getByKey, { key: "content_catalog_published" });
        if (res && res.success && res.data) {
          setPublishedBackup(res.data as CatalogData);
        }
      } catch (e) {
        console.warn("Could not query published content catalog from Convex:", e);
      }
    };
    fetchPublished();
  }, []);

  // Show quick status helper
  const triggerStatus = (text: string, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Check if anything has diverged from database schema
  const handleSaveDraft = async (updatedCatalog: CatalogData) => {
    try {
      await setSetting({ key: "content_catalog_draft", data: updatedCatalog });
      localStorage.setItem("ona_mock_content_catalog_draft", JSON.stringify(updatedCatalog));
      setDraftCatalog(updatedCatalog);
      setIsModified(true);
      triggerStatus("Draft saved successfully.");
    } catch (e) {
      console.error(e);
      triggerStatus("Failed to save draft to Convex. Saved locally.", true);
      localStorage.setItem("ona_mock_content_catalog_draft", JSON.stringify(updatedCatalog));
    }
  };

  const handlePublishLive = async () => {
    if (!isAdmin) {
      triggerStatus("You lack editorial authorization to publish.", true);
      return;
    }
    try {
      await setSetting({ key: "content_catalog_published", data: catalog });
      await setSetting({ key: "content_catalog_draft", data: catalog });
      
      // Store in standard active published config and fire dispatch trigger
      localStorage.setItem("ona_mock_content_catalog", JSON.stringify(catalog));
      window.dispatchEvent(new Event("ona_content_catalog_updated"));

      setPublishedBackup(catalog);
      setDraftCatalog(catalog);
      setIsModified(false);
      triggerStatus("Content catalog published live to user screens immediately!");
    } catch (e) {
      console.error(e);
      triggerStatus("Failed to publish live to Convex. Local override dispatched.", true);
      localStorage.setItem("ona_mock_content_catalog", JSON.stringify(catalog));
      window.dispatchEvent(new Event("ona_content_catalog_updated"));
    }
  };

  // Restore/Unpublish backup options
  const handleUnpublishRestore = async () => {
    if (!publishedBackup) {
      triggerStatus("No previous published backup snapshot found.", true);
      return;
    }
    if (window.confirm("Rollback and restore catalog content back to the last active published snapshot?")) {
      setCatalog(publishedBackup);
      await handleSaveDraft(publishedBackup);
      triggerStatus("Reverted current draft changes back to active live system.");
    }
  };

  // DYNAMIC COLUMN BUILDER
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerStatus("Only Super Admins can add or modify dynamic table columns.", true);
      return;
    }
    
    const formattedId = newColumn.id.trim().replace(/\s+/g, "");
    if (!formattedId) {
      triggerStatus("Field ID identifier is required.", true);
      return;
    }

    // Check if duplicate field ID
    const activeTable = catalog.tables[activeTableKey];
    if (activeTable.fields.some(f => f.id === formattedId)) {
      triggerStatus(`Field ID '${formattedId}' already exists in this table.`, true);
      return;
    }

    const fieldObj: FieldDef = {
      ...newColumn,
      id: formattedId,
      options: newColumnOptionsString ? newColumnOptionsString.split(",").map(o => o.trim()) : undefined
    };

    const updatedTables = {
      ...catalog.tables,
      [activeTableKey]: {
        ...activeTable,
        fields: [...activeTable.fields, fieldObj]
      }
    };

    const updatedCatalog = {
      ...catalog,
      tables: updatedTables
    };

    setCatalog(updatedCatalog);
    handleSaveDraft(updatedCatalog);
    setIsAddColumnOpen(false);
    // Reset form
    setNewColumn({
      id: "",
      label: "",
      type: "text",
      required: false,
      defaultValue: "",
      placeholder: "",
      helpText: "",
      visibility: "show"
    });
    setNewColumnOptionsString("");
    triggerStatus(`Column '${fieldObj.label}' appended to ${activeTable.label}.`);
  };

  const handleDeleteColumn = (fieldId: string) => {
    if (!isSuperAdmin) {
      triggerStatus("Unauthorized. Super Admin clearance required.", true);
      return;
    }

    if (["id", "name", "price", "image", "title", "email"].includes(fieldId)) {
      triggerStatus("Cannot delete a primary core schema column.", true);
      return;
    }

    if (window.confirm(`Warning: Deleting column '${fieldId}' will permanently remove values stored under this field across all rows of this table. Archive metadata instead? Click 'OK' to delete or Cancel to abort.`)) {
      const activeTable = catalog.tables[activeTableKey];
      const updatedFields = activeTable.fields.filter(f => f.id !== fieldId);
      
      // Clean records values
      const updatedRecords = (catalog.records[activeTableKey] || []).map(row => {
        const cleaned = { ...row };
        delete cleaned[fieldId];
        return cleaned;
      });

      const updatedCatalog = {
        ...catalog,
        tables: {
          ...catalog.tables,
          [activeTableKey]: {
            ...activeTable,
            fields: updatedFields
          }
        },
        records: {
          ...catalog.records,
          [activeTableKey]: updatedRecords
        }
      };

      setCatalog(updatedCatalog);
      handleSaveDraft(updatedCatalog);
      triggerStatus(`Deleted and scrubbed column metadata '${fieldId}' successfully.`);
    }
  };

  // DYNAMIC ROW MANAGEMENT
  const triggerOpenAddRow = () => {
    const payload: Record<string, any> = {};
    const activeTable = catalog.tables[activeTableKey];
    activeTable.fields.forEach(f => {
      payload[f.id] = f.defaultValue !== undefined ? f.defaultValue : (f.type === "toggle" ? false : "");
    });
    // Set auto ID
    payload["id"] = "item_" + Math.random().toString(36).substring(2, 9);
    setRowFormPayload(payload);
    setIsAddRowOpen(true);
  };

  const handleAddRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      triggerStatus("Staff accounts cannot write new rows.", true);
      return;
    }

    const activeTable = catalog.tables[activeTableKey];
    // Validate required fields
    for (const field of activeTable.fields) {
      if (field.required && !rowFormPayload[field.id]) {
        if (field.type !== "toggle") {
          triggerStatus(`Field '${field.label}' is required.`, true);
          return;
        }
      }
    }

    const tableRows = catalog.records[activeTableKey] || [];
    const updatedCatalog = {
      ...catalog,
      records: {
        ...catalog.records,
        [activeTableKey]: [...tableRows, rowFormPayload]
      }
    };

    setCatalog(updatedCatalog);
    handleSaveDraft(updatedCatalog);
    setIsAddRowOpen(false);
    triggerStatus("Row entry successfully generated.");
  };

  const triggerOpenEditRow = (index: number) => {
    const tableRows = catalog.records[activeTableKey] || [];
    const targetRow = tableRows[index];
    setRowFormPayload({ ...targetRow });
    setActiveEditRowIndex(index);
    setIsEditRowOpen(true);
  };

  const handleEditRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      triggerStatus("Normal accounts cannot save content edits.", true);
      return;
    }
    if (activeEditRowIndex === null) return;

    const tableRows = [...(catalog.records[activeTableKey] || [])];
    tableRows[activeEditRowIndex] = rowFormPayload;

    const updatedCatalog = {
      ...catalog,
      records: {
        ...catalog.records,
        [activeTableKey]: tableRows
      }
    };

    setCatalog(updatedCatalog);
    handleSaveDraft(updatedCatalog);
    setIsEditRowOpen(false);
    setActiveEditRowIndex(null);
    triggerStatus("Row entry updated successfully.");
  };

  const handleDeleteRow = (index: number) => {
    if (!isAdmin) {
      triggerStatus("Unauthorized.", true);
      return;
    }
    if (window.confirm("Are you sure you want to permanently delete this row? This action is irreversible.")) {
      const tableRows = [...(catalog.records[activeTableKey] || [])];
      tableRows.splice(index, 1);

      const updatedCatalog = {
        ...catalog,
        records: {
          ...catalog.records,
          [activeTableKey]: tableRows
        }
      };

      setCatalog(updatedCatalog);
      handleSaveDraft(updatedCatalog);
      triggerStatus("Selected row purged.");
    }
  };

  const handleDuplicateRow = (index: number) => {
    const tableRows = [...(catalog.records[activeTableKey] || [])];
    const source = tableRows[index];
    const copy = {
      ...source,
      id: "item_copy_" + Math.random().toString(36).substring(2, 9),
      name: source.name ? source.name + " (Copy)" : undefined,
      title: source.title ? source.title + " (Copy)" : undefined
    };

    const updatedCatalog = {
      ...catalog,
      records: {
        ...catalog.records,
        [activeTableKey]: [...tableRows.slice(0, index + 1), copy, ...tableRows.slice(index + 1)]
      }
    };

    setCatalog(updatedCatalog);
    handleSaveDraft(updatedCatalog);
    triggerStatus("Row duplicated successfully.");
  };

  // Reordering
  const handleReorderRow = (index: number, direction: "up" | "down") => {
    const tableRows = [...(catalog.records[activeTableKey] || [])];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === tableRows.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = tableRows[index];
    tableRows[index] = tableRows[targetIndex];
    tableRows[targetIndex] = temp;

    const updatedCatalog = {
      ...catalog,
      records: {
        ...catalog.records,
        [activeTableKey]: tableRows
      }
    };

    setCatalog(updatedCatalog);
    handleSaveDraft(updatedCatalog);
    triggerStatus("Row priority order swapped.");
  };

  // Bulk actions
  const handleToggleRowSelection = (rowId: string) => {
    setSelectedRowIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSelectAllRows = (rows: any[]) => {
    if (selectedRowIds.length === rows.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(rows.map(r => r.id || ""));
    }
  };

  const handleBulkDelete = () => {
    if (!isAdmin) {
      triggerStatus("Unauthorised to perform bulk deletes.", true);
      return;
    }
    if (selectedRowIds.length === 0) return;

    if (window.confirm(`Bulk delete ${selectedRowIds.length} selected row records?`)) {
      const tableRows = catalog.records[activeTableKey] || [];
      const updatedRows = tableRows.filter(r => !selectedRowIds.includes(r.id || ""));

      const updatedCatalog = {
        ...catalog,
        records: {
          ...catalog.records,
          [activeTableKey]: updatedRows
        }
      };

      setCatalog(updatedCatalog);
      handleSaveDraft(updatedCatalog);
      setSelectedRowIds([]);
      triggerStatus(`Bulk deleted ${selectedRowIds.length} rows.`);
    }
  };

  // Simulate Image / File uploads directly inside dynamic fields
  const handleFieldFileUpload = (fieldId: string, file: File) => {
    setFieldUploadProgress(prev => ({ ...prev, [fieldId]: 10 }));
    
    // Simulate upload reading file base64 format for mock preview logic
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      const interval = setInterval(() => {
        setFieldUploadProgress(prev => {
          const current = prev[fieldId] || 10;
          if (current >= 95) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [fieldId]: current + 30 };
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setFieldUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });
        setRowFormPayload(prev => ({ ...prev, [fieldId]: result }));
        triggerStatus(`Uploaded attachment file bound to field '${fieldId}'.`);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  // Filter and Search logic
  const activeDef = catalog.tables[activeTableKey] || { label: "Table", fields: [] };
  const getFilteredRows = () => {
    let rows = catalog.records[activeTableKey] || [];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(query)
        );
      });
    }
    return rows;
  };

  const currentRows = getFilteredRows();

  return (
    <div className="space-y-6 text-[#3E301F]">
      
      {/* Top Banner Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#171411] to-[#241E19] text-white p-5 border border-[#CBBDA9]/20 shadow-md">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-light text-gold-300 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold-400" />
            <span>DYNAMIC CONTENT CATALOG MANAGER</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-sans tracking-wide">
            Model custom schemas, create additional table columns and edit database rows securely without writing code.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Real-time Preview Target selector */}
          <div className="flex flex-col gap-1 items-start mr-1">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Real-time Preview Engine</span>
            <div className="flex bg-[#110E0C] p-0.5 border border-[#CBBDA9]/20 rounded-xs">
              <button
                type="button"
                onClick={() => handleTogglePreviewMode("draft")}
                className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                  globalPreviewMode === "draft"
                    ? "bg-[#C5A070] text-black shadow-inner"
                    : "text-gray-400 hover:text-white"
                }`}
                title="View dynamic changes instantly on front page"
              >
                Draft (Active)
              </button>
              <button
                type="button"
                onClick={() => handleTogglePreviewMode("published")}
                className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                  globalPreviewMode === "published"
                    ? "bg-[#C5A070] text-black shadow-inner"
                    : "text-gray-400 hover:text-white"
                }`}
                title="View published live website catalog"
              >
                Published Live
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {isModified && (
              <button
                onClick={handleUnpublishRestore}
                className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-wider transition cursor-pointer font-sans"
                title="Discard draft changes, revert back to live published data"
              >
                Discard Changes
              </button>
            )}
            <button
              onClick={handlePublishLive}
              disabled={!isAdmin}
              className="px-5 py-2.5 bg-[#C5A070] hover:bg-[#B38F5F] text-black font-semibold text-xs uppercase tracking-widest transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
            >
              <Globe className="w-4 h-4" />
              Publish Live Schema
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 border text-xs font-sans tracking-wide font-medium flex items-center gap-2 ${
            statusMsg.isError 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {statusMsg.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </motion.div>
      )}

      {/* Main Grid: LHS Table list, RHS Rows Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LHS List of Dynamic Tables */}
        <div className="lg:col-span-3 bg-[#FCFAF5] border border-[#CBBDA9]/40 p-4 space-y-4">
          <div className="border-b border-[#CBBDA9]/30 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Dynamic CMS Tables</span>
            <p className="text-[9px] text-gray-400 italic">Select table to view schema & records</p>
          </div>
          
          <div className="flex flex-col space-y-1">
            {(Object.values(catalog.tables) as TableDef[]).map(tbl => {
              const isActive = tbl.id === activeTableKey;
              const recordCount = (catalog.records[tbl.id] || []).length;
              return (
                <button
                  key={tbl.id}
                  onClick={() => {
                    setActiveTableKey(tbl.id);
                    setSelectedRowIds([]);
                  }}
                  className={`w-full text-left font-sans text-xs uppercase tracking-[0.1em] py-3 px-3 transition flex items-center justify-between border-l-2 focus:outline-none cursor-pointer ${
                    isActive
                      ? "bg-[#ECE5D8] text-[#3E301F] border-[#3E301F] font-bold"
                      : "bg-transparent text-gray-600 border-transparent hover:bg-[#FAF6F0]"
                  }`}
                >
                  <span className="truncate pr-1">{tbl.label}</span>
                  <span className="bg-white/75 border border-[#CBBDA9]/40 px-1.5 py-0.5 text-[9px] text-gray-500 font-mono tracking-normal shrink-0 rounded-xs">
                    {recordCount}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="p-3 bg-[#FAF6F0] border border-[#CBBDA9]/20 space-y-2 mt-4 text-[11px] text-gray-500 leading-relaxed font-light">
            <h4 className="font-bold flex items-center gap-1 uppercase tracking-wider text-[#3E301F] text-[10px]">
              <Settings className="w-3.5 h-3.5" />
              Role Permissions
            </h4>
            <p>Super Admins inherit rights to append dynamic custom columns matching arbitrary fields. Admins modify specific row contents immediately.</p>
          </div>
        </div>

        {/* RHS Rows Catalog Grid */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Active Schema & Control Header bar */}
          <div className="bg-[#FCFAF5] border border-[#CBBDA9]/40 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#CBBDA9]/20 pb-4">
              <div>
                <span className="text-[10px] font-sans text-amber-800 uppercase tracking-widest font-bold">ACTIVE DATABASE SCHEMA</span>
                <h3 className="font-serif text-2xl text-[#3E301F] font-normal tracking-wide">{activeDef.label}</h3>
                <p className="text-[11px] text-gray-500 font-sans mt-0.5 italic">{activeDef.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isSuperAdmin && (
                  <button
                    onClick={() => setIsAddColumnOpen(true)}
                    className="px-3 py-2 border border-[#8C6D4F] text-[#8C6D4F] hover:bg-[#8C6D4F]/5 text-[10px] uppercase font-bold tracking-widest transition flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Add Custom Column
                  </button>
                )}
                <button
                  onClick={triggerOpenAddRow}
                  className="px-4 py-2 bg-[#8C6D4F] hover:bg-[#725438] text-white text-[10px] uppercase font-bold tracking-widest transition flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Row
                </button>
              </div>
            </div>

            {/* Sub Filter & Layout options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Query records in this catalog..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF6F0] pl-9 pr-4 py-1.5 border border-[#CBBDA9]/30 text-xs focus:outline-none focus:border-[#8C6D4F]"
                />
              </div>

              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                {selectedRowIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Bulk Delete ({selectedRowIds.length})
                  </button>
                )}
                
                <span className="h-5 w-px bg-gray-300" />

                <div className="flex bg-[#FAF6F0] p-1 border border-[#CBBDA9]/20 rounded-xs">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 ${viewMode === "table" ? "bg-white text-amber-800 shadow-2xs" : "text-gray-400 hover:text-gray-600"} cursor-pointer transition`}
                    title="List Table view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-1.5 ${viewMode === "card" ? "bg-white text-amber-800 shadow-2xs" : "text-gray-400 hover:text-gray-600"} cursor-pointer transition`}
                    title="Card grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table / Grid Render View */}
          {currentRows.length === 0 ? (
            <div className="text-center bg-[#FCFAF5] py-16 border border-[#CBBDA9]/40 space-y-2">
              <Table className="w-8 h-8 text-gray-300 mx-auto" />
              <h4 className="font-serif text-lg text-gray-500 font-light">No row matches found.</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">No matching entries are allocated inside '{activeDef.label}'. Generate first rows or relax filtering criteria.</p>
              <button
                onClick={triggerOpenAddRow}
                className="mt-2 text-xs font-bold text-amber-800 uppercase hover:underline"
              >
                Create initial entry &rarr;
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* Table View Layout */
            <div className="bg-[#FCFAF5] border border-[#CBBDA9]/40 overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#CBBDA9]/40 text-[9px] uppercase tracking-widest text-[#3E301F] font-bold">
                    <th className="px-3.5 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === currentRows.length}
                        onChange={() => handleSelectAllRows(currentRows)}
                        className="w-3 h-3 cursor-pointer"
                      />
                    </th>
                    <th className="px-3.5 py-4 w-16 text-center">Priority</th>
                    
                    {/* Dynamic column headers based on database schema */}
                    {activeDef.fields.map(field => {
                      const isCore = ["id", "name", "title", "price", "image"].includes(field.id);
                      return (
                        <th key={field.id} className="px-4 py-4 text-[10px] font-sans font-bold">
                          <div className="flex items-center gap-1.5">
                            <span>{field.label}</span>
                            {!isCore && isSuperAdmin && (
                              <button
                                onClick={() => handleDeleteColumn(field.id)}
                                className="text-red-400 hover:text-red-600 ml-1 transition"
                                title={`Delete column ${field.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[8px] font-mono font-light tracking-tight text-gray-400 block normal-case font-normal mt-0.5">
                            {field.type} • {field.visibility}
                          </span>
                        </th>
                      );
                    })}
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBBDA9]/20 text-xs font-sans">
                  {currentRows.map((row, index) => {
                    const rowId = row.id || `row_${index}`;
                    const isSelected = selectedRowIds.includes(rowId);
                    return (
                      <tr 
                        key={rowId} 
                        className={`hover:bg-[#FAF6F0]/60 transition ${isSelected ? "bg-[#ECE5D8]/45" : ""}`}
                      >
                        <td className="px-3.5 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRowSelection(rowId)}
                            className="w-3 h-3 cursor-pointer"
                          />
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <button
                              onClick={() => handleReorderRow(index, "up")}
                              disabled={index === 0}
                              className="hover:text-amber-800 disabled:opacity-20 cursor-pointer transition"
                              title="Move Row Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleReorderRow(index, "down")}
                              disabled={index === currentRows.length - 1}
                              className="hover:text-amber-800 disabled:opacity-20 cursor-pointer transition"
                              title="Move Row Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Rendering dynamic table cells */}
                        {activeDef.fields.map(field => {
                          const val = row[field.id];
                          return (
                            <td key={field.id} className="px-4 py-3 text-[11px] leading-relaxed max-w-[180px] truncate">
                              {field.type === "image" ? (
                                val ? (
                                  <img 
                                    src={val} 
                                    alt="thumb" 
                                    referrerPolicy="no-referrer"
                                    className="h-8 w-12 object-cover border border-[#CBBDA9]/30 rounded-xs bg-gray-100" 
                                  />
                                ) : (
                                  <span className="text-gray-400 italic">No image</span>
                                )
                              ) : field.type === "toggle" ? (
                                <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs font-mono inline-block ${
                                  val ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-400"
                                }`}>
                                  {val ? "Active" : "Off"}
                                </span>
                              ) : field.type === "color" ? (
                                <div className="flex items-center gap-1 font-mono text-[9px]">
                                  <div className="w-3.5 h-3.5 border border-[#CBBDA9]/50 rounded-xs" style={{ backgroundColor: val || "#FFF" }} />
                                  <span>{val || "None"}</span>
                                </div>
                              ) : field.type === "status" ? (
                                <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-xs font-mono inline-block ${
                                  val === "Confirmed" || val === "Approved" || val === "Read" || val === "Replied"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : val === "Pending" || val === "Unread" || val === "Contacted"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                                }`}>
                                  {val || "Pending"}
                                </span>
                              ) : (
                                <span className="text-gray-600 leading-snug">{String(val || "-")}</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Action pathways */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => triggerOpenEditRow(index)}
                              className="p-1 hover:text-[#8C6D4F] transition text-gray-400 cursor-pointer"
                              title="Edit Row Content"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateRow(index)}
                              className="p-1 hover:text-amber-800 transition text-gray-400 cursor-pointer"
                              title="Duplicate Item Row"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(index)}
                              className="p-1 hover:text-red-600 transition text-gray-400 cursor-pointer"
                              title="Purge row entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card view Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentRows.map((row, index) => {
                // Find potential image and title from schema list
                const titleField = activeDef.fields.find(f => f.id === "name" || f.id === "title" || f.id === "question")?.id || "id";
                const imgField = activeDef.fields.find(f => f.type === "image")?.id || "";
                const priceField = activeDef.fields.find(f => f.type === "price")?.id || "";
                
                return (
                  <div 
                    key={index} 
                    className="bg-[#FCFAF5] border border-[#CBBDA9]/40 p-4 space-y-3 rounded-xs flex flex-col justify-between transition hover:shadow-xs"
                  >
                    <div className="space-y-2">
                      {imgField && row[imgField] && (
                        <div className="aspect-[3/2] w-full overflow-hidden border border-[#CBBDA9]/20 bg-gray-100 rounded-2xs relative">
                          <img
                            src={row[imgField]}
                            alt="card preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-start gap-1 pr-1">
                          <h4 className="font-serif text-[#3E301F] text-sm font-bold tracking-tight line-clamp-1">{row[titleField] || "Unnamed Record"}</h4>
                          {priceField && row[priceField] && <span className="text-[11px] font-mono text-amber-800 font-semibold">{row[priceField]}</span>}
                        </div>
                        {row.description && <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">{row.description}</p>}
                      </div>
                    </div>

                    <div className="border-t border-[#CBBDA9]/20 pt-2 flex justify-between items-center bg-[#FAF6F0]/20 -mx-4 -mb-4 p-3 mt-2">
                      <span className="text-[9px] font-mono text-gray-400">Order: #{index + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => triggerOpenEditRow(index)}
                          className="px-2 py-1 border border-[#CBBDA9]/40 hover:border-[#8C6D4F] text-[9px] uppercase tracking-wider font-semibold cursor-pointer text-gray-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRow(index)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] uppercase tracking-wider font-semibold border border-red-100 cursor-pointer transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD COLUMN DIALOG */}
      <AnimatePresence>
        {isAddColumnOpen && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FCFAF5] border border-[#CBBDA9] max-w-md w-full p-6 text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#CBBDA9]/20 pb-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Columns className="w-4 h-4" />
                  <h4 className="font-serif text-lg font-light tracking-wide">ADD ADDITIONAL CUSTOM FIELD</h4>
                </div>
                <button
                  onClick={() => setIsAddColumnOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddColumnSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">Field ID Identifier (No spaces)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. spiceLevel, portionSize"
                      value={newColumn.id}
                      onChange={e => setNewColumn(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">Field Human Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spice Rating"
                      value={newColumn.label}
                      onChange={e => setNewColumn(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">Input Type format</label>
                    <select
                      value={newColumn.type}
                      onChange={e => setNewColumn(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                    >
                      <option value="text">Text Inline</option>
                      <option value="textarea">Long Text Scroll</option>
                      <option value="number">Numeric Number</option>
                      <option value="price">Price Currency</option>
                      <option value="date">Date picker</option>
                      <option value="time">Time picker</option>
                      <option value="select">Dropdown Menu Select</option>
                      <option value="toggle">Toggle option checkbox</option>
                      <option value="image">Image Attachment Url</option>
                      <option value="file">Local File Attachment Url</option>
                      <option value="url">URL Hyperlink</option>
                      <option value="color">Hex Color Picker</option>
                      <option value="status">Status Badge badges</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">Frontend Placement</label>
                    <select
                      value={newColumn.visibility}
                      onChange={e => setNewColumn(prev => ({ ...prev, visibility: e.target.value as any }))}
                      className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                    >
                      <option value="show">Show Everywhere on public site</option>
                      <option value="hide">Hide entirely from website</option>
                      <option value="admin_only">Restrict viewing to Admin Only</option>
                      <option value="menu_detail">Detail view popup elements</option>
                      <option value="card_view">Visible in tiny outer tile cards</option>
                      <option value="expanded_view">Expanded detailed modals</option>
                    </select>
                  </div>
                </div>

                {newColumn.type === "select" && (
                  <div className="space-y-1 p-2 bg-[#FAF6F0] border border-[#CBBDA9]/20 rounded-xs">
                    <label className="font-bold text-[9px] uppercase tracking-wider text-[#8C6D4F]">Dropdown Option Values (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Mild, Medium, Hot, Inferno"
                      value={newColumnOptionsString}
                      onChange={e => setNewColumnOptionsString(e.target.value)}
                      className="w-full bg-white p-1.5 border border-[#CBBDA9]/30 text-xs focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">Informative Help Tooltip text for operators</label>
                  <input
                    type="text"
                    placeholder="Brief guide explaining required format constraints"
                    value={newColumn.helpText}
                    onChange={e => setNewColumn(prev => ({ ...prev, helpText: e.target.value }))}
                    className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 text-[#8C6D4F]">
                  <input
                    id="req-chk"
                    type="checkbox"
                    checked={newColumn.required}
                    onChange={e => setNewColumn(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-[#8C6D4F]"
                  />
                  <label htmlFor="req-chk" className="font-bold text-[10px] uppercase tracking-wider select-none cursor-pointer">Required Field Validation constraint</label>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-[#CBBDA9]/25 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddColumnOpen(false)}
                    className="px-4 py-2 border border-[#CBBDA9]/30 text-gray-500 hover:bg-[#CBBDA9]/10 uppercase text-[10px] font-bold tracking-widest cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#8C6D4F] hover:bg-[#725438] text-white uppercase text-[10px] font-bold tracking-widest cursor-pointer shadow-sm transition"
                  >
                    Append to table schema
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD / EDIT ROW DIALOG (DYNAMICAL FORM FIELDS CREATED ON THE FLY) */}
      <AnimatePresence>
        {(isAddRowOpen || isEditRowOpen) && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FCFAF5] border border-[#CBBDA9] max-w-lg w-full p-6 text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#CBBDA9]/25 pb-3">
                <div className="flex items-center gap-2 text-[#8C6D4F]">
                  {isAddRowOpen ? <PlusCircle className="w-4.5 h-4.5" /> : <Edit3 className="w-4.5 h-4.5" />}
                  <h4 className="font-serif text-lg font-light tracking-wide uppercase">
                    {isAddRowOpen ? `INSERT NEW RECORD ENTRY IN ${activeTableKey}` : `REVISE SELECTED RECORD IN ${activeTableKey}`}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setIsAddRowOpen(false);
                    setIsEditRowOpen(false);
                    setActiveEditRowIndex(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form 
                onSubmit={isAddRowOpen ? handleAddRowSubmit : handleEditRowSubmit} 
                className="space-y-4 text-xs font-sans max-h-[60vh] overflow-y-auto pr-2"
              >
                {activeDef.fields.map(field => {
                  const val = rowFormPayload[field.id];
                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <label className="font-bold text-[10px] uppercase tracking-wider text-gray-500">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.helpText && <span className="text-[8px] text-amber-800 italic">{field.helpText}</span>}
                      </div>

                      {/* Text inputs matching format specs */}
                      {field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder || `Enter long ${field.label}...`}
                          required={field.required}
                          value={val || ""}
                          onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                          rows={3}
                          className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                        />
                      ) : field.type === "select" ? (
                        <select
                          required={field.required}
                          value={val || ""}
                          onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                        >
                          <option value="">-- Choose option --</option>
                          {field.options?.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : field.type === "status" ? (
                        <select
                          required={field.required}
                          value={val || ""}
                          onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                        >
                          {field.options?.map(o => (
                            <option key={o} value={o}>{o}</option>
                          )) || (
                            <>
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Cancelled">Cancelled</option>
                            </>
                          )}
                        </select>
                      ) : field.type === "toggle" ? (
                        <div className="flex items-center gap-2">
                          <input
                            id={`row-toggle-${field.id}`}
                            type="checkbox"
                            checked={!!val}
                            onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.checked }))}
                            className="w-4 h-4 accent-[#8C6D4F]"
                          />
                          <label htmlFor={`row-toggle-${field.id}`} className="select-none text-gray-500 py-1 font-semibold text-[10px] uppercase cursor-pointer">
                            Enable Tag option
                          </label>
                        </div>
                      ) : field.type === "color" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={val || "#C5A070"}
                            onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-8 h-8 border border-[#CBBDA9]/30 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="#FFFFFF hex"
                            value={val || ""}
                            onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="bg-[#FAF6F0] p-1.5 text-xs font-mono border border-[#CBBDA9]/30 max-w-[120px]"
                          />
                        </div>
                      ) : field.type === "image" || field.type === "file" ? (
                        <div className="space-y-1.5 bg-[#FAF6F0]/50 p-2.5 border border-[#CBBDA9]/20 rounded-xs">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={val || ""}
                              onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="flex-grow bg-white p-1.5 border border-[#CBBDA9]/30 text-[10px] font-mono focus:outline-none"
                              placeholder="Direct HTTPS or uploaded reference asset..."
                            />
                            <div className="relative border border-dashed border-gray-400 hover:border-amber-800 transition cursor-pointer px-3 flex items-center justify-center bg-white">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  if (e.target.files?.[0]) handleFieldFileUpload(field.id, e.target.files[0]);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <span className="text-[10px] uppercase font-bold text-gray-500">Upload</span>
                            </div>
                          </div>
                          {fieldUploadProgress[field.id] !== undefined && (
                            <div className="w-full bg-gray-200 h-1 overflow-hidden rounded-full">
                              <div className="bg-[#C5A070] h-full transition-all duration-300" style={{ width: `${fieldUploadProgress[field.id]}%` }} />
                            </div>
                          )}
                          {val && field.type === "image" && (
                            <div className="mt-1 h-16 w-24 overflow-hidden border border-[#CBBDA9]/30 rounded-xs relative">
                              <img 
                                src={val} 
                                alt="asset proof preview" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder || `Enter ${field.label}...`}
                          required={field.required}
                          value={val || ""}
                          onChange={e => setRowFormPayload(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full bg-[#FAF6F0] p-2 border border-[#CBBDA9]/30 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-end gap-2.5 border-t border-[#CBBDA9]/25 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddRowOpen(false);
                      setIsEditRowOpen(false);
                      setActiveEditRowIndex(null);
                    }}
                    className="px-4 py-2 border border-[#CBBDA9]/30 text-gray-500 hover:bg-[#CBBDA9]/10 uppercase text-[10px] font-bold tracking-widest cursor-pointer transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#8C6D4F] hover:bg-[#725438] text-white uppercase text-[10px] font-bold tracking-widest cursor-pointer shadow-sm transition"
                  >
                    Save & Apply Metadata
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Reset trigger definitions
export function handleResetToDefault() {
  if (window.confirm("Confirm: Reinitialize the database back to standard default menu lists and core aesthetic settings? Wait, draft values are completely replaced.")) {
    setDoc(doc(db, "admin_settings", "content_catalog_draft"), {
      tables: DEFAULT_TABLE_DEFS,
      records: SEED_RECORDS
    }).catch(err => console.error(err));
    setDoc(doc(db, "admin_settings", "content_catalog_published"), {
      tables: DEFAULT_TABLE_DEFS,
      records: SEED_RECORDS
    }).catch(err => console.error(err));
    localStorage.setItem("ona_mock_content_catalog_draft", JSON.stringify({ tables: DEFAULT_TABLE_DEFS, records: SEED_RECORDS }));
    localStorage.setItem("ona_mock_content_catalog", JSON.stringify({ tables: DEFAULT_TABLE_DEFS, records: SEED_RECORDS }));
    window.dispatchEvent(new Event("ona_content_catalog_updated"));
    window.location.reload();
  }
}
