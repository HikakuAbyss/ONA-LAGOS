import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Check, 
  X, 
  Upload, 
  ArrowUpDown, 
  Sparkles, 
  FileText,
  DollarSign,
  Layers,
  Link,
  Info,
  ChevronDown,
  Trash,
  Image,
  Star,
  Crown,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { OnaLifestyleProduct } from "../types";
import { DEFAULT_LIFESTYLE_PRODUCTS } from "./OnaLifestyleView";

interface OnaLifestyleManagerProps {
  currentUser: {
    uid: string;
    email: string;
    role: "Super Admin" | "Admin" | "Staff" | "User";
  };
}

export default function OnaLifestyleManager({ currentUser }: OnaLifestyleManagerProps) {
  const [products, setProducts] = useState<OnaLifestyleProduct[]>(() => {
    // Initial loading from localStorage (shared fallback)
    const local = localStorage.getItem("ona_lifestyle_products");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return DEFAULT_LIFESTYLE_PRODUCTS;
      }
    }
    return DEFAULT_LIFESTYLE_PRODUCTS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [publishFilter, setPublishFilter] = useState("All");
  
  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OnaLifestyleProduct | null>(null);

  // Form State Values
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<OnaLifestyleProduct["category"]>("Merchandise");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formGalleryInput, setFormGalleryInput] = useState("");
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | "">("");
  const [formStockStatus, setFormStockStatus] = useState<OnaLifestyleProduct["stockStatus"]>("In Stock");
  const [formQuantity, setFormQuantity] = useState<number | "">("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublishStatus, setFormPublishStatus] = useState<OnaLifestyleProduct["publishStatus"]>("Published");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formTagsInput, setFormTagsInput] = useState("");
  const [formCtaType, setFormCtaType] = useState<OnaLifestyleProduct["ctaType"]>("Order via WhatsApp");
  const [formCtaLink, setFormCtaLink] = useState("");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");

  // Upload feedback helper
  const [isUploading, setIsUploading] = useState(false);

  // Standalone Quick Gallery Editor state
  const [quickGalleryProduct, setQuickGalleryProduct] = useState<OnaLifestyleProduct | null>(null);
  const [quickFeaturedImage, setQuickFeaturedImage] = useState<string>("");
  const [quickGalleryImages, setQuickGalleryImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Multi file reader utility with size checks (limit: <= 5MB)
  const handleMultipleFiles = (files: FileList | File[], appendToGallery: boolean, callback: (urls: string[]) => void) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds our secure 5MB limitation constraint.`);
        return false;
      }
      const isImg = file.type.startsWith("image/");
      if (!isImg) {
        alert(`File "${file.name}" is not a recognized image format.`);
      }
      return isImg;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let loadedCount = 0;
    const results: string[] = [];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        results.push(result);
        loadedCount++;
        if (loadedCount === validFiles.length) {
          callback(results);
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "dragend") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, appendToGallery: boolean, callback: (urls: string[]) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files, appendToGallery, callback);
    }
  };

  const handleCoverSwap = (
    index: number, 
    currentCover: string, 
    galleryList: string[], 
    setCover: (c: string) => void, 
    setGallery: (g: string[]) => void
  ) => {
    const newCover = galleryList[index];
    const newGallery = galleryList.filter((_, idx) => idx !== index);
    if (currentCover) {
      newGallery.unshift(currentCover);
    }
    setCover(newCover);
    setGallery(newGallery);
  };

  const handleMoveGalleryIdx = (
    index: number, 
    direction: 'left' | 'right', 
    list: string[], 
    setList: (l: string[]) => void
  ) => {
    const newList = [...list];
    if (direction === 'left' && index > 0) {
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    } else if (direction === 'right' && index < newList.length - 1) {
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    }
    setList(newList);
  };

  const openQuickGallery = (prod: OnaLifestyleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickGalleryProduct(prod);
    setQuickFeaturedImage(prod.imageUrl || "https://images.unsplash.com/photo-1603006905393-0d4133464e83?w=800&auto=format&fit=crop&q=80");
    setQuickGalleryImages(prod.galleryImages || []);
  };

  const saveQuickGallery = async () => {
    if (!quickGalleryProduct) return;
    const updated = products.map(p => {
      if (p.id === quickGalleryProduct.id) {
        return {
          ...p,
          imageUrl: quickFeaturedImage,
          featuredImage: quickFeaturedImage,
          galleryImages: quickGalleryImages,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    try {
      await updateDoc(doc(db, "onaLifestyleProducts", quickGalleryProduct.id), {
        imageUrl: quickFeaturedImage,
        featuredImage: quickFeaturedImage,
        galleryImages: quickGalleryImages,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore save deferred", err);
    }

    saveStateToStorage(updated);
    setQuickGalleryProduct(null);
  };

  // Load from database if possible
  const syncProductsFromDB = async () => {
    try {
      const collRef = collection(db, "onaLifestyleProducts");
      const snap = await getDocs(collRef);
      const list: OnaLifestyleProduct[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as OnaLifestyleProduct);
      });
      if (list.length > 0) {
        // Sort display order
        list.sort((a, b) => a.displayOrder - b.displayOrder);
        setProducts(list);
        localStorage.setItem("ona_lifestyle_products", JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Could not retrieve Firestore products, using local state store.", e);
    }
  };

  useEffect(() => {
    syncProductsFromDB();
  }, []);

  // Save changes wrapper
  const saveStateToStorage = (updatedList: OnaLifestyleProduct[]) => {
    // Sort display order ascending
    const sorted = [...updatedList].sort((a, b) => a.displayOrder - b.displayOrder);
    setProducts(sorted);
    localStorage.setItem("ona_lifestyle_products", JSON.stringify(sorted));
    // Dispatch event to update other component windows
    window.dispatchEvent(new Event("ona_lifestyle_products_changed"));
  };

  // Check roles
  const canEdit = currentUser.role === "Super Admin" || currentUser.role === "Admin";

  // Currency formattings
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("NGN", "₦");
  };

  // Convert uploaded image to Base64 String
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Selected image exceeds our secure 5MB size limit.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isGallery) {
        setFormGalleryImages(prev => [...prev, result]);
      } else {
        setFormImageUrl(result);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Populate form values for Adding or Editing
  const openFormModal = (item: OnaLifestyleProduct | null = null) => {
    if (!canEdit) {
      alert("Staff accounts are limited to read-only views for premium catalog assets.");
      return;
    }
    
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormDescription(item.description);
      setFormImageUrl(item.imageUrl);
      setFormGalleryImages(item.galleryImages || []);
      setFormPrice(item.price);
      setFormDiscountPrice(item.discountPrice === null ? "" : item.discountPrice);
      setFormStockStatus(item.stockStatus);
      setFormQuantity(item.quantityAvailable === null ? "" : item.quantityAvailable);
      setFormFeatured(item.featured);
      setFormPublishStatus(item.publishStatus);
      setFormDisplayOrder(item.displayOrder);
      setFormTagsInput(item.tags.join(", "));
      setFormCtaType(item.ctaType);
      setFormCtaLink(item.ctaLink);
      setFormSeoTitle(item.seoTitle || "");
      setFormSeoDescription(item.seoDescription || "");
    } else {
      setEditingItem(null);
      setFormName("");
      setFormCategory("Merchandise");
      setFormDescription("");
      setFormImageUrl("");
      setFormGalleryImages([]);
      setFormPrice("");
      setFormDiscountPrice("");
      setFormStockStatus("In Stock");
      setFormQuantity("");
      setFormFeatured(false);
      setFormPublishStatus("Published");
      
      // Auto displayOrder calculation (max + 1)
      const maxOrder = products.reduce((max, p) => p.displayOrder > max ? p.displayOrder : max, 0);
      setFormDisplayOrder(maxOrder + 1);
      
      setFormTagsInput("Premium, Exclusive");
      setFormCtaType("Order via WhatsApp");
      setFormCtaLink("https://wa.me/234900000000");
      setFormSeoTitle("");
      setFormSeoDescription("");
    }
    setIsFormOpen(true);
  };

  // Submitting the Product form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!formName.trim()) {
      alert("Product name is a required field.");
      return;
    }
    if (formPrice === "" || Number(formPrice) < 0) {
      alert("Please provide a valid numeric baseline price.");
      return;
    }

    const priceNum = Number(formPrice);
    const discountNum = formDiscountPrice === "" ? null : Number(formDiscountPrice);
    const quantityNum = formQuantity === "" ? null : Number(formQuantity);
    
    // Convert tags string to pristine list
    const tagsArr = formTagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const productSlug = formName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const productPayload: Omit<OnaLifestyleProduct, "id"> = {
      name: formName,
      slug: productSlug,
      category: formCategory,
      description: formDescription,
      imageUrl: formImageUrl || "https://images.unsplash.com/photo-1603006905393-0d4133464e83?w=800&auto=format&fit=crop&q=80",
      galleryImages: formGalleryImages,
      price: priceNum,
      discountPrice: discountNum,
      stockStatus: formStockStatus,
      quantityAvailable: quantityNum,
      featured: formFeatured,
      publishStatus: formPublishStatus,
      displayOrder: Number(formDisplayOrder),
      tags: tagsArr,
      ctaType: formCtaType,
      ctaLink: formCtaLink,
      seoTitle: formSeoTitle || `${formName} | Ona Store`,
      seoDescription: formSeoDescription || formDescription.slice(0, 150),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedList = [...products];
    const docId = editingItem ? editingItem.id : `lf_${Date.now()}`;

    try {
      // 1. Write to database
      await setDoc(doc(db, "onaLifestyleProducts", docId), productPayload);
    } catch (err) {
      console.warn("Offline fallback triggered for write operations.");
    }

    // 2. Parallel state update
    if (editingItem) {
      updatedList = products.map(p => p.id === editingItem.id ? { id: editingItem.id, ...productPayload } : p);
    } else {
      updatedList.push({ id: docId, ...productPayload });
    }

    saveStateToStorage(updatedList);
    setIsFormOpen(false);
  };

  // Duplicate product helper
  const handleDuplicateProduct = async (item: OnaLifestyleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;

    const newId = `lf_dup_${Date.now()}`;
    const duplicated: OnaLifestyleProduct = {
      ...item,
      id: newId,
      name: `${item.name} (Copy)`,
      displayOrder: item.displayOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "onaLifestyleProducts", newId), {
        name: duplicated.name,
        slug: duplicated.slug + "-copy",
        category: duplicated.category,
        description: duplicated.description,
        imageUrl: duplicated.imageUrl,
        galleryImages: duplicated.galleryImages || [],
        price: duplicated.price,
        discountPrice: duplicated.discountPrice,
        stockStatus: duplicated.stockStatus,
        quantityAvailable: duplicated.quantityAvailable,
        featured: duplicated.featured,
        publishStatus: duplicated.publishStatus,
        displayOrder: duplicated.displayOrder,
        tags: duplicated.tags,
        ctaType: duplicated.ctaType,
        ctaLink: duplicated.ctaLink,
        seoTitle: duplicated.seoTitle,
        seoDescription: duplicated.seoDescription,
        createdAt: duplicated.createdAt,
        updatedAt: duplicated.updatedAt
      });
    } catch (err) {}

    saveStateToStorage([...products, duplicated]);
  };

  // Delete product helper
  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;

    if (!confirm("Are you certain you wish to purge this lifestyle product from digital records? This can't be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "onaLifestyleProducts", id));
    } catch (err) {}

    saveStateToStorage(products.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  // Toggle Publish Status easily from row
  const togglePublishStatus = async (item: OnaLifestyleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;

    const nextStatus: OnaLifestyleProduct["publishStatus"] = 
      item.publishStatus === "Published" ? "Unpublished" : "Published";

    try {
      await updateDoc(doc(db, "onaLifestyleProducts", item.id), {
        publishStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {}

    saveStateToStorage(products.map(p => p.id === item.id ? { ...p, publishStatus: nextStatus, updatedAt: new Date().toISOString() } : p));
  };

  // Toggle featured status from row
  const toggleFeaturedStatus = async (item: OnaLifestyleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;

    const nextFeatured = !item.featured;
    try {
      await updateDoc(doc(db, "onaLifestyleProducts", item.id), {
        featured: nextFeatured,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {}

    saveStateToStorage(products.map(p => p.id === item.id ? { ...p, featured: nextFeatured, updatedAt: new Date().toISOString() } : p));
  };

  // Update displays orders directly in cell
  const handleOrderChange = async (item: OnaLifestyleProduct, newOrder: number) => {
    if (!canEdit) return;

    try {
      await updateDoc(doc(db, "onaLifestyleProducts", item.id), {
        displayOrder: newOrder,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {}

    saveStateToStorage(products.map(p => p.id === item.id ? { ...p, displayOrder: newOrder, updatedAt: new Date().toISOString() } : p));
  };

  // Bulk operation triggers
  const executeBulkPublish = async (publish: boolean) => {
    if (!canEdit) return;
    if (selectedIds.length === 0) return;

    const status: OnaLifestyleProduct["publishStatus"] = publish ? "Published" : "Unpublished";
    for (const id of selectedIds) {
      try {
        await updateDoc(doc(db, "onaLifestyleProducts", id), {
          publishStatus: status,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {}
    }

    saveStateToStorage(products.map(p => selectedIds.includes(p.id) ? { ...p, publishStatus: status, updatedAt: new Date().toISOString() } : p));
    alert(`Successfully bulk ${publish ? "published" : "unpublished"} ${selectedIds.length} objects.`);
    setSelectedIds([]);
  };

  const executeBulkDelete = async () => {
    if (!canEdit) return;
    if (selectedIds.length === 0) return;

    if (!confirm(`purge all ${selectedIds.length} checked luxury items from servers?`)) {
      return;
    }

    for (const id of selectedIds) {
      try {
        await deleteDoc(doc(db, "onaLifestyleProducts", id));
      } catch (err) {}
    }

    saveStateToStorage(products.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  // Select all helper of current filtered list
  const handleSelectAll = (filteredItems: OnaLifestyleProduct[]) => {
    const filteredIds = filteredItems.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Matching Query Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesStock = stockFilter === "All" || p.stockStatus === stockFilter;
    const matchesPublish = publishFilter === "All" || p.publishStatus === publishFilter;

    return matchesSearch && matchesCategory && matchesStock && matchesPublish;
  });

  return (
    <div id="lifestyle-manager-panel" className="w-full space-y-8 font-sans text-gray-800">
      
      {/* Dynamic Upper Metrics Summary Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Catalog", val: products.length, sub: "All lifestyle segments" },
          { title: "Published Active", val: products.filter(p => p.publishStatus === "Published").length, sub: "Live on the homepage/lifestyle space" },
          { title: "Low Stock / Preorder", val: products.filter(p => p.stockStatus === "Low Stock" || p.stockStatus === "Preorder").length, sub: "Limited acquisitions remaining" },
          { title: "Draft Items", val: products.filter(p => p.publishStatus === "Draft").length, sub: "In staging preview environment" }
        ].map((met, idx) => (
          <div key={`idx-met-${idx}`} className="bg-white border border-[#CBBDA9]/40 p-5 rounded-sm shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-400">{met.title}</span>
            <span className="text-3xl font-serif text-[#3E301F] mt-2 mb-1">{met.val}</span>
            <span className="text-[10px] text-gray-400 leading-snug">{met.sub}</span>
          </div>
        ))}
      </div>

      {/* Control Actions & Filtering Panels */}
      <div className="bg-white border border-[#CBBDA9] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product names, tags, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCFAF5]/80 placeholder-gray-400 border border-[#CBBDA9]/60 focus:border-[#4A3518] rounded-none py-2.5 pl-10 pr-4 text-xs font-serif text-[#3E301F] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-[#FCFAF5] border border-[#CBBDA9]/40 px-3 py-2 text-[11px] text-[#8C6D4F] font-mono">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-[#CBBDA9]/60 py-2 px-3 text-[11px] text-[#3E301F] focus:outline-none focus:border-[#4A3518] rounded-none"
            >
              <option value="All">All Categories</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Food Product">Food Product</option>
              <option value="Drink Product">Drink Product</option>
              <option value="Gift Item">Gift Item</option>
              <option value="Home & Lifestyle">Home & Lifestyle</option>
              <option value="Limited Edition">Limited Edition</option>
              <option value="Other">Other</option>
            </select>

            {/* Stock status drop */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-white border border-[#CBBDA9]/60 py-2 px-3 text-[11px] text-[#3E301F] focus:outline-none focus:border-[#4A3518] rounded-none"
            >
              <option value="All">All Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Preorder">Preorder</option>
            </select>

            {/* Publish Drop */}
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="bg-white border border-[#CBBDA9]/60 py-2 px-3 text-[11px] text-[#3E301F] focus:outline-none focus:border-[#4A3518] rounded-none"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Unpublished">Unpublished</option>
            </select>

            {/* Add product button */}
            {canEdit && (
              <button
                onClick={() => openFormModal(null)}
                className="cursor-pointer bg-[#3E301F] hover:bg-[#8C6D4F] text-white font-sans text-xs uppercase tracking-widest font-semibold py-2.5 px-4 flex items-center gap-2 rounded-none transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
          </div>
        </div>

        {/* Checked select row action */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center justify-between p-3.5 bg-neutral-900 text-[#FCFAF7] rounded-none"
          >
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-pulse" />
              <span>{selectedIds.length} checked lifestyle catalog items selected:</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => executeBulkPublish(true)}
                className="cursor-pointer bg-neutral-800 hover:bg-[#3E301F] border border-gold-400/30 font-sans text-[10px] uppercase font-semibold text-gold-300 tracking-wider py-1.5 px-3 rounded-none"
              >
                Publish All
              </button>
              <button
                onClick={() => executeBulkPublish(false)}
                className="cursor-pointer bg-neutral-800 hover:bg-[#3E301F] border border-gold-400/30 font-sans text-[10px] uppercase font-semibold text-gray-400 tracking-wider py-1.5 px-3 rounded-none"
              >
                Unpublish All
              </button>
              <button
                onClick={executeBulkDelete}
                className="cursor-pointer bg-rose-950 text-rose-200 border border-rose-500/20 hover:bg-rose-900 font-sans text-[10px] uppercase font-semibold tracking-wider py-1.5 px-3 rounded-none"
              >
                Purge All
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-[10px] text-gray-300 underline py-1.5 px-1 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Table view of Ona Lifestyle */}
      <div className="bg-white border border-[#CBBDA9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF6F0] border-b border-[#CBBDA9] text-gray-600 font-medium select-none text-[10px] uppercase tracking-widest leading-normal">
                <th className="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      filteredProducts.every(p => selectedIds.includes(p.id))
                    }
                    onChange={() => handleSelectAll(filteredProducts)}
                    className="w-4 h-4 cursor-pointer focus:ring-0 checked:bg-[#3E301F]"
                  />
                </th>
                <th className="py-4 px-4">Item Thumbnail</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-center">Order</th>
                <th className="py-4 px-4">Market Price</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-4">Status</th>
                {canEdit && <th className="py-4 px-4 text-right">Actions Index</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBBDA9]/30 text-[#3E301F]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400 font-serif italic bg-[#FCFAF5]/20">
                    <ShoppingBag className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                     No product models matching selected parameters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isChecked = selectedIds.includes(prod.id);
                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-[#FCFAF5]/40 transition-colors ${isChecked ? "bg-gold-50/20" : ""}`}
                    >
                      {/* Check box selection column */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedIds(prev => 
                              isChecked ? prev.filter(i => i !== prod.id) : [...prev, prod.id]
                            );
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Image Preview thumbnail */}
                      <td className="py-4 px-4 overflow-visible">
                        <div 
                          onClick={(e) => openQuickGallery(prod, e)}
                          className="w-12 h-12 bg-neutral-100 border border-gold-400/20 overflow-hidden relative cursor-pointer group rounded-xs shadow-xs"
                          title="Click of manage quick image settings"
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-0 right-0 bg-neutral-900/90 text-[8px] tracking-tight text-gold-300 font-mono px-1 font-bold rounded-tl-xs">
                            📸 {1 + (prod.galleryImages?.length || 0)}
                          </div>
                        </div>
                      </td>

                      {/* Name & Short description */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-serif font-semibold text-sm line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed font-light">{prod.description}</div>
                      </td>

                      {/* Category field status badge */}
                      <td className="py-4 px-4 font-serif">
                        <span className="text-[11px] font-semibold text-[#8C6D4F]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Sorter displayed order */}
                      <td className="py-4 px-4 text-center w-20">
                        <input
                          type="number"
                          value={prod.displayOrder}
                          onChange={(e) => handleOrderChange(prod, Number(e.target.value))}
                          disabled={!canEdit}
                          className="w-12 bg-transparent text-center border-b border-gray-200 focus:border-[#4A3518] text-xs font-serif focus:outline-none"
                        />
                      </td>

                      {/* Pricings */}
                      <td className="py-4 px-4 font-mono select-all">
                        {prod.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-semibold">{formatNaira(prod.discountPrice)}</span>
                            <span className="text-[10px] text-gray-400 line-through decoration-rose-500/50 mt-0.5">{formatNaira(prod.price)}</span>
                          </div>
                        ) : (
                          <span>{formatNaira(prod.price)}</span>
                        )}
                        {prod.quantityAvailable !== null && (
                          <span className="text-[9px] text-gray-400 block font-light mt-0.5">Avail: {prod.quantityAvailable} units</span>
                        )}
                      </td>

                      {/* Stock Status Badge selector */}
                      <td className="py-4 px-4 font-medium uppercase font-sans tracking-wide">
                        {prod.stockStatus === "In Stock" && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-sm">In Stock</span>
                        )}
                        {prod.stockStatus === "Low Stock" && (
                          <span className="text-[10px] text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-sm">Low Stock</span>
                        )}
                        {prod.stockStatus === "Out of Stock" && (
                          <span className="text-[10px] text-red-600 bg-red-100/60 px-2 py-0.5 rounded-sm">Out of Stock</span>
                        )}
                        {prod.stockStatus === "Preorder" && (
                          <span className="text-[10px] text-gold-400 bg-gold-50/70 px-2 py-0.5 rounded-sm border border-gold-200">Preorder</span>
                        )}
                      </td>

                      {/* Featured active page Switch */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => toggleFeaturedStatus(prod, e)}
                          disabled={!canEdit}
                          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-sm transition-colors mx-auto ${
                            prod.featured 
                              ? "bg-amber-100 border border-amber-300 text-amber-500 hover:bg-amber-200" 
                              : "bg-neutral-100 border border-neutral-300 text-neutral-400 hover:bg-neutral-200"
                          }`}
                          title="Featured spotlight on homepage"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Published details state badge */}
                      <td className="py-4 px-4 font-medium font-mono text-[11px] select-none">
                        <button
                          onClick={(e) => togglePublishStatus(prod, e)}
                          disabled={!canEdit}
                          className={`cursor-pointer hover:underline text-left uppercase text-[9px] font-bold tracking-widest ${
                            prod.publishStatus === "Published"
                              ? "text-emerald-600"
                              : prod.publishStatus === "Draft"
                              ? "text-amber-500"
                              : "text-gray-400"
                          }`}
                        >
                          {prod.publishStatus}
                        </button>
                      </td>

                      {/* Inline Actions Index */}
                      {canEdit && (
                        <td className="py-4 px-4 text-right w-36 overflow-visible">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => openQuickGallery(prod, e)}
                              className="p-1.5 text-[#8C6D4F] hover:text-gold-300 hover:bg-neutral-100 cursor-pointer rounded-xs"
                              title="Manage image gallery quick editor"
                            >
                              <Image className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => openFormModal(prod)}
                              className="p-1.5 text-gray-500 hover:text-gold-300 hover:bg-neutral-100 cursor-pointer rounded-xs"
                              title="Edit item attributes"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDuplicateProduct(prod, e)}
                              className="p-1.5 text-gray-500 hover:text-gold-300 hover:bg-neutral-100 cursor-pointer rounded-xs"
                              title="Duplicate catalog item"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProduct(prod.id, e)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-neutral-100 cursor-pointer rounded-xs"
                              title="Purge catalog row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adding / Editing Modal Control Form Sheet overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#12110E]/60 backdrop-blur-sm z-50 flex items-center justify-end p-0"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="bg-[#FAF6F0] w-full max-w-xl h-full shadow-2xl relative flex flex-col pointer-events-auto h-screen border-l border-[#CBBDA9]"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Card Header information panel */}
              <div className="bg-[#12110E] p-6 text-[#FCFAF7] flex items-center justify-between border-b border-gold-400/20">
                <div className="space-y-1">
                  <span className="text-[10px] text-gold-300 font-mono tracking-widest uppercase">Admin Management console</span>
                  <h3 className="font-serif text-lg tracking-wide font-light">
                    {editingItem ? `Alter properties: ${editingItem.name}` : "Integrate New Lifestyle product model"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 border border-[#FCFAF7]/10 hover:border-gold-300 hover:text-gold-300 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input areas */}
              <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 text-[#3E301F] text-xs">
                
                {/* Visual Category / Name details */}
                <div className="space-y-4 bg-white p-4 border border-[#CBBDA9]/40 rounded-sm">
                  <div className="flex gap-1 items-center font-serif text-[11px] uppercase tracking-wider text-[#8C6D4F] font-bold border-b pb-2">
                    <Layers className="w-3.5 h-3.5" /> Core Segment Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Product Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Handmade Mud-weave Scented Candle"
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Category Group <span className="text-rose-500">*</span></label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                      >
                        <option value="Merchandise">Merchandise</option>
                        <option value="Food Product">Food Product</option>
                        <option value="Drink Product">Drink Product</option>
                        <option value="Gift Item">Gift Item</option>
                        <option value="Home & Lifestyle">Home & Lifestyle</option>
                        <option value="Limited Edition">Limited Edition</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-[10px] text-gray-500 uppercase">Product Narrative Description</label>
                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Share ambient insights, materials used, artisanal details, aromas or craftsmanship profiles..."
                      className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Primary Financial Controls */}
                <div className="space-y-4 bg-white p-4 border border-[#CBBDA9]/40 rounded-sm">
                  <div className="flex gap-1 items-center font-serif text-[11px] uppercase tracking-wider text-[#8C6D4F] font-bold border-b pb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Valuation & Stock Matrix
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Retail Price (₦) <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="35000"
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Discount cost (₦) <span className="text-gray-400">(Optional)</span></label>
                      <input
                        type="number"
                        min="0"
                        value={formDiscountPrice}
                        onChange={(e) => setFormDiscountPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="30000"
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Reserve Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="unlimited"
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Stock status option</label>
                      <select
                        value={formStockStatus}
                        onChange={(e) => setFormStockStatus(e.target.value as any)}
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Preorder">Preorder</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">Display Index Order</label>
                      <input
                        type="number"
                        min="1"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Section of Images */}
                <div className="space-y-4 bg-white p-5 border border-[#CBBDA9]/40 rounded-sm">
                  <div className="flex gap-1.5 items-center font-serif text-[11px] uppercase tracking-wider text-[#8C6D4F] font-bold border-b pb-2">
                    <Upload className="w-3.5 h-3.5" /> High-End Media Assets Suite
                  </div>

                  {/* Drag and Drop Master zone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, true, (urls) => {
                      if (!formImageUrl) {
                        setFormImageUrl(urls[0]);
                        setFormGalleryImages(prev => [...prev, ...urls.slice(1)]);
                      } else {
                        setFormGalleryImages(prev => [...prev, ...urls]);
                      }
                    })}
                    className={`border-2 border-dashed rounded-xs p-6 text-center transition-all ${
                      dragActive 
                        ? "border-gold-400 bg-gold-50/30 scale-[0.99]" 
                        : "border-[#CBBDA9]/50 bg-[#FCFAF5]/50 hover:bg-[#FCFAF5]"
                    }`}
                  >
                    <div className="space-y-2 pointer-events-none">
                      <Image className="w-8 h-8 mx-auto text-gold-400/80 animate-pulse" />
                      <p className="font-serif text-xs text-[#3E301F] font-medium">Drag and drop premium product photo files here</p>
                      <p className="text-[10px] text-gray-400 font-light font-sans">
                        PNG, JPG, JPEG, WEBP formats up to 5MB (4:5 / 1:1 luxury ratio encouraged)
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="w-8 h-[1px] bg-[#CBBDA9]/30" />
                        <span className="text-[9px] uppercase tracking-widest text-[#8C6D4F] font-mono">or</span>
                        <span className="w-8 h-[1px] bg-[#CBBDA9]/30" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <label className="cursor-pointer bg-[#3E301F] hover:bg-[#8C6D4F] text-white text-[10px] uppercase font-semibold tracking-wider py-2 px-4 select-none flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Upload Cover Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleMultipleFiles(e.target.files, false, (urls) => setFormImageUrl(urls[0]));
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase font-semibold tracking-wider py-2 px-4 select-none flex items-center gap-1.5 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Multi-Add Gallery
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              handleMultipleFiles(e.target.files, true, (urls) => {
                                setFormGalleryImages(prev => [...prev, ...urls]);
                              });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploading && (
                      <div className="text-[11px] text-[#8C6D4F] font-mono mt-3 flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" />
                        <span>Rendering digital visual assets...</span>
                      </div>
                    )}
                  </div>

                  {/* Image input links fallback */}
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[9px] text-[#8C6D4F] uppercase">Featured cover URL link</label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="Or paste direct image URL links manually here..."
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-1.5 px-3 focus:outline-none text-[10px] font-mono"
                      />
                    </div>
                  </div>

                  {/* Master Visual Layout for Active Assets */}
                  <div className="space-y-3 pt-3">
                    <span className="font-semibold block text-[10px] text-gray-500 uppercase tracking-wide border-b pb-1">Media Layout Previews</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Active cover rendering */}
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wide flex items-center gap-1">
                          <Crown className="w-3 h-3 text-gold-400" /> Featured Cover
                        </span>
                        {formImageUrl ? (
                          <div className="relative aspect-square border border-gold-400/30 overflow-hidden bg-neutral-100 rounded-sm group shadow-sm">
                            <img src={formImageUrl} alt="Primary" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormImageUrl("")}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-sm cursor-pointer shadow-md"
                              title="Clear Cover Image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-square border border-dashed border-[#CBBDA9]/40 flex flex-col items-center justify-center text-gray-300 font-mono text-[9px] bg-[#FCFAF5]/25">
                            No Cover
                          </div>
                        )}
                      </div>

                      {/* Additional Gallery images with interactive actions */}
                      <div className="sm:col-span-3 space-y-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                          Gallery images spotlights ({formGalleryImages.length})
                        </span>
                        {formGalleryImages.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                            {formGalleryImages.map((gImg, gIdx) => (
                              <div key={`form-gl-${gIdx}`} className="relative aspect-square border border-gold-400/10 overflow-hidden bg-neutral-100 group rounded-sm shadow-sm">
                                <img src={gImg} alt="Gallery th" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                
                                {/* Overlay action trigger sheets */}
                                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1 z-15">
                                  {/* Top buttons row */}
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => handleCoverSwap(gIdx, formImageUrl, formGalleryImages, setFormImageUrl, setFormGalleryImages)}
                                      className="bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-sm cursor-pointer shadow-md"
                                      title="Set this image as primary featured cover"
                                    >
                                      <Crown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFormGalleryImages(prev => prev.filter((_, idx) => idx !== gIdx))}
                                      className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-sm cursor-pointer shadow-md"
                                      title="Delete image"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Bottom slide controls */}
                                  <div className="flex items-center justify-center gap-1 bg-black/55 py-0.5 rounded-sm">
                                    <button
                                      type="button"
                                      disabled={gIdx === 0}
                                      onClick={() => handleMoveGalleryIdx(gIdx, 'left', formGalleryImages, setFormGalleryImages)}
                                      className="text-white hover:text-gold-300 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </button>
                                    <span className="text-[8px] text-gray-300 font-mono font-bold">{gIdx + 1}</span>
                                    <button
                                      type="button"
                                      disabled={gIdx === formGalleryImages.length - 1}
                                      onClick={() => handleMoveGalleryIdx(gIdx, 'right', formGalleryImages, setFormGalleryImages)}
                                      className="text-white hover:text-gold-300 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-28 border border-dashed border-[#CBBDA9]/30 flex flex-col items-center justify-center text-gray-400 font-serif italic text-[10px] bg-[#FCFAF5]/10">
                             No secondary image pins in gallery list.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call To Action options */}
                <div className="space-y-4 bg-white p-4 border border-[#CBBDA9]/40 rounded-sm">
                  <div className="flex gap-1 items-center font-serif text-[11px] uppercase tracking-wider text-[#8C6D4F] font-bold border-b pb-2">
                    <Link className="w-3.5 h-3.5" /> Call-to-Action Configurations
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">CTA Button Action Type</label>
                      <select
                        value={formCtaType}
                        onChange={(e) => setFormCtaType(e.target.value as any)}
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                      >
                        <option value="Order via WhatsApp">Order via WhatsApp</option>
                        <option value="Enquire Now">Enquire Now (Scrolls or emails)</option>
                        <option value="Coming Soon">Coming Soon (Disabled item)</option>
                        <option value="View Details">View Details Modal</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-500 uppercase">CTA Trigger Link / WhatsApp Phone</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="e.g. https://wa.me/234900000000"
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none text-[10px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-[10px] text-gray-500 uppercase">Tags <span className="text-gray-400">(Comma separated)</span></label>
                    <input
                      type="text"
                      value={formTagsInput}
                      onChange={(e) => setFormTagsInput(e.target.value)}
                      placeholder="Premium, Limited, Gift, New Arrival"
                      className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Publish & SEO settings */}
                <div className="space-y-4 bg-white p-4 border border-[#CBBDA9]/40 rounded-sm">
                  <div className="flex gap-1 items-center font-serif text-[11px] uppercase tracking-wider text-[#8C6D4F] font-bold border-b pb-2">
                    <FileText className="w-3.5 h-3.5" /> Controls, SEO & Visibility
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-gray-400 uppercase">Publish State</label>
                      <select
                        value={formPublishStatus}
                        onChange={(e) => setFormPublishStatus(e.target.value as any)}
                        className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none"
                      >
                        <option value="Published">Published (Live on Website)</option>
                        <option value="Draft">Draft (In Staging Preview)</option>
                        <option value="Unpublished">Unpublished (Archived)</option>
                      </select>
                    </div>

                    {/* Toggle Featured */}
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="form-featured-toggle"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 text-[#3E301F] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="form-featured-toggle" className="font-semibold text-[10px] uppercase text-gray-500 cursor-pointer select-none">
                        Show in Spotlight section on homepage
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="font-semibold block text-[10px] text-gray-500 uppercase">SEO Page Title <span className="text-gray-400">(Optional override)</span></label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="e.g. Limited Edition Lagos Hardwood boards - Ona Store"
                      className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-[10px] text-gray-500 uppercase">SEO Metadata Description</label>
                    <input
                      type="text"
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      placeholder="e.g. Masterful hand-forged African mahogany wood server sets."
                      className="w-full bg-[#FCFAF5] border border-[#CBBDA9]/60 focus:border-[#4A3518] py-2 px-3 focus:outline-none text-[10px]"
                    />
                  </div>
                </div>

              </form>

              {/* Lower execution control actions */}
              <div className="p-4 bg-white border-t border-[#CBBDA9] flex items-center justify-end gap-3 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="cursor-pointer border border-[#8C6D4F] hover:bg-[#FCFAF5] font-sans text-xs uppercase tracking-widest font-semibold py-2.5 px-5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="cursor-pointer bg-[#3E301F] hover:bg-[#8C6D4F] text-white font-sans text-xs uppercase tracking-widest font-semibold py-2.5 px-6 transition-colors font-bold"
                >
                  {editingItem ? "Update parameters" : "Commit Lifestyle Item"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone Quick Gallery Editor Modal */}
      <AnimatePresence>
        {quickGalleryProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setQuickGalleryProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-2 border-gold-400/40 w-full max-w-2xl overflow-hidden shadow-2xl rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-neutral-900 via-amber-955 to-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-gold-300" />
                  <div>
                    <h3 className="font-serif font-semibold text-sm text-gold-200">Manage Picture Gallery</h3>
                    <p className="text-[10px] text-gray-300 font-light font-sans">{quickGalleryProduct.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setQuickGalleryProduct(null)}
                  className="p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-4">
                {/* Drag zone inside quick popup */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={(e) => handleDrop(e, true, (urls) => {
                    if (!quickFeaturedImage) {
                      setQuickFeaturedImage(urls[0]);
                      setQuickGalleryImages(prev => [...prev, ...urls.slice(1)]);
                    } else {
                      setQuickGalleryImages(prev => [...prev, ...urls]);
                    }
                  })}
                  className={`border-2 border-dashed rounded-xs p-5 text-center transition-all ${
                    dragActive 
                      ? "border-gold-400 bg-gold-50/20" 
                      : "border-[#CBBDA9]/40 bg-[#FCFAF5]"
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto text-gold-400/80 mb-1 animate-pulse" />
                  <p className="font-serif text-[11px] text-[#3E301F] font-medium">Drag & drop files to add them directly</p>
                  <p className="text-[9px] text-gray-400 font-sans font-light">
                    PNG, JPG, JPEG, WEBP files (Max 5MB per image, cinematic aspect ratio suggested)
                  </p>
                  
                  <div className="mt-2.5 flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-[#3E301F] hover:bg-[#8C6D4F] text-white text-[9px] uppercase font-bold tracking-wider py-1.5 px-3 select-none flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" /> Select Files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            handleMultipleFiles(e.target.files, true, (urls) => {
                              setQuickGalleryImages(prev => [...prev, ...urls]);
                            });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {isUploading && (
                  <p className="text-center text-[10px] text-[#8C6D4F] font-mono animate-bounce">
                    Rendering file streams...
                  </p>
                )}

                {/* Cover Asset Selection */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="md:col-span-1 space-y-1">
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <Crown className="w-3 h-3 text-gold-400" /> Featured Cover
                    </span>
                    {quickFeaturedImage ? (
                      <div className="relative aspect-square border border-gold-300 rounded-sm overflow-hidden shadow-sm bg-neutral-100">
                        <img src={quickFeaturedImage} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400 font-mono">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                      Gallery Spotlights ({quickGalleryImages.length})
                    </span>
                    {quickGalleryImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {quickGalleryImages.map((gImg, gIdx) => (
                          <div key={`quick-gl-${gIdx}`} className="relative aspect-square border border-gold-400/10 rounded-sm overflow-hidden group shadow-sm bg-neutral-100">
                            <img src={gImg} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1 z-15">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleCoverSwap(gIdx, quickFeaturedImage, quickGalleryImages, setQuickFeaturedImage, setQuickGalleryImages)}
                                  className="bg-amber-500 text-white p-0.5 rounded-sm cursor-pointer shadow-md"
                                  title="Set featured cover"
                                >
                                  <Crown className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuickGalleryImages(prev => prev.filter((_, idx) => idx !== gIdx))}
                                  className="bg-rose-600 text-white p-0.5 rounded-sm cursor-pointer shadow-md"
                                  title="Delete picture"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Shuffle index controls */}
                              <div className="flex items-center justify-center gap-1 bg-black/60 py-0.5 rounded-sm">
                                <button
                                  type="button"
                                  disabled={gIdx === 0}
                                  onClick={() => handleMoveGalleryIdx(gIdx, 'left', quickGalleryImages, setQuickGalleryImages)}
                                  className="text-white hover:text-gold-200 disabled:opacity-35 cursor-pointer"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-[8px] text-gray-100 font-mono font-bold">{gIdx + 1}</span>
                                <button
                                  type="button"
                                  disabled={gIdx === quickGalleryImages.length - 1}
                                  onClick={() => handleMoveGalleryIdx(gIdx, 'right', quickGalleryImages, setQuickGalleryImages)}
                                  className="text-white hover:text-gold-200 disabled:opacity-35 cursor-pointer"
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-28 border border-dashed border-[#CBBDA9]/20 bg-[#FCFAF5]/30 rounded-xs flex items-center justify-center font-serif text-[10px] text-gray-400 italic">
                        No gallery images added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Save operations */}
              <div className="p-4 bg-[#FCFAF5] border-t border-[#CBBDA9]/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickGalleryProduct(null)}
                  className="font-sans text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-gray-700 py-1.5 px-3 border border-gray-300 rounded-sm bg-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={saveQuickGallery}
                  className="font-sans text-[10px] uppercase font-bold tracking-wider text-white bg-[#3E301F] hover:bg-[#8C6D4F] py-1.5 px-4 rounded-sm cursor-pointer shadow-sm font-bold"
                >
                  Save Gallery Changes
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
