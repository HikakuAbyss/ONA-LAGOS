export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  categories: Array<
    | "starters"
    | "signatures"
    | "seafood"
    | "grills"
    | "vegetarian"
    | "kids"
    | "desserts"
    | "cocktails"
    | "mocktails"
    | "wine"
    | "sunday"
  >;
  dietary: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isSpicy?: boolean;
    hasNuts?: boolean;
    isKidsFriendly?: boolean;
    isMild?: boolean;
  };
  image: string;
}

export interface GalleryItem {
  id: string;
  category: "food" | "drinks" | "interior" | "outdoor" | "guests" | "events" | "chef";
  title: string;
  image: string;
}

export interface OnaLifestyleProduct {
  id: string;
  name: string;
  slug: string;
  category: "Merchandise" | "Food Product" | "Drink Product" | "Gift Item" | "Home & Lifestyle" | "Limited Edition" | "Other";
  description: string;
  imageUrl: string;
  featuredImage?: string;
  galleryImages?: string[];
  price: number;
  discountPrice: number | null;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock" | "Preorder";
  quantityAvailable: number | null;
  featured: boolean;
  publishStatus: "Draft" | "Published" | "Unpublished";
  displayOrder: number;
  tags: string[];
  ctaType: "Order via WhatsApp" | "Enquire Now" | "Coming Soon" | "View Details";
  ctaLink: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export const MENU_ITEMS: MenuItem[] = [
  // STARTERS
  {
    id: "s1",
    name: "Suya Spiced Beef Tartare",
    description: "Finely hand-cut grass-fed Nigerian beef with house-crafted suya spice, slow-cured quail egg yolk, spring onions, served with toasted local brioche toast.",
    price: "₦14,500",
    categories: ["starters"],
    dietary: { isSpicy: true, hasNuts: true },
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "s2",
    name: "Crispy Asun Arancini",
    description: "Saffron risotto balls infused with tender, smoked spicy goat meat (asun) and local aromatic herbs, stuffed with fontina cheese, served with a sweet red habanero jam.",
    price: "₦12,000",
    categories: ["starters"],
    dietary: { isSpicy: true },
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "s3",
    name: "Truffled Yam Croquette",
    description: "Creamy white yam mash roasted with fresh black truffles, coated in crispy panko, served over a light cream of wild mushrooms and micro-greens.",
    price: "₦10,500",
    categories: ["starters", "vegetarian", "kids"],
    dietary: { isVegetarian: true, isKidsFriendly: true, isMild: true },
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
  },
  
  // SIGNATURE AFRICAN DISHES
  {
    id: "sig1",
    name: "Deconstructed Efo Riro Ravioli",
    description: "Handmade silk pasta squares filled with wild-caught Atlantic lobster and spinach, served on a bed of rich red pepper reduction and locust bean foam.",
    price: "₦26,000",
    categories: ["signatures"],
    dietary: { isMild: true },
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sig2",
    name: "Slow-Braised Short Rib Jollof Risotto",
    description: "A gorgeous cross between premium Italian risotto techniques and rich smoked West African Jollof, topped with 24-hour braised short rib falling off the bone and local plantain tuile.",
    price: "₦32,500",
    categories: ["signatures", "sunday"],
    dietary: { isSpicy: true },
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sig3",
    name: "Seared Duck Breast in Scent Leaf broth",
    description: "Premium French Barbary duck breast pan seared, cooked medium, served in an aromatic local scent leaf & lemongrass infusion with glazed white sweet potato fondant.",
    price: "₦28,000",
    categories: ["signatures"],
    dietary: { isGlutenFree: true, isMild: true },
    image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&auto=format&fit=crop&q=80"
  },

  // SEAFOOD
  {
    id: "sea1",
    name: "Charred Chargrilled Jumbo Prawns",
    description: "Giant ocean prawns wild-harvested from the Atlantic, marinated in garlic scent-leaf butter, flame-kissed and served with papaya-mango relish and plantain croquette.",
    price: "₦38,000",
    categories: ["seafood"],
    dietary: { isGlutenFree: true, isMild: true },
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sea2",
    name: "Pan-Roasted Atlantic Red Snapper",
    description: "Crisp-skinned local red snapper fillet served over a velvety wild cocoyam purée, wilted native uziza spinach, and citrus-infused pepper sauce.",
    price: "₦29,000",
    categories: ["seafood"],
    dietary: { isGlutenFree: true },
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
  },

  // GRILLS
  {
    id: "gr1",
    name: "Prime Aged Ribeye with Suya glaze",
    description: "400g prime Ribeye, dry-aged for 28 days, encrusted in signature Yaji spice-rub, grilled over hardwood, finished with house bone-marrow jus.",
    price: "₦46,000",
    categories: ["grills"],
    dietary: { isSpicy: true, hasNuts: true },
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "gr2",
    name: "Scent Leaf Crusted Lamb Chops",
    description: "Tender rack of lamb glazed in honey mustard and fresh Lagos scent leaf crust, roasted medium-rare, served with yam gnocchi in goat cheese sauce.",
    price: "₦38,500",
    categories: ["grills", "sunday"],
    dietary: { isMild: true },
    image: "https://images.unsplash.com/photo-1602881917445-0b1ba001addf?w=600&auto=format&fit=crop&q=80"
  },

  // VEGETARIAN
  {
    id: "v1",
    name: "Moni-Moni Mushroom Terrine",
    description: "Local wild mushroom selection and crushed organic kidney bean terrine, layered with aromatic peppers and wrapped in sweet potato leaf, served cold with light herb emulsification.",
    price: "₦18,000",
    categories: ["vegetarian"],
    dietary: { isVegetarian: true, isVegan: true, isGlutenFree: true },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "v2",
    name: "Efo Shoko & Ricotta Dumpling",
    description: "Fluffy handmade cheese dumplings folded with fresh green Shoko spinach, poached in a velvety fire-roasted yellow bell pepper coulis.",
    price: "₦21,000",
    categories: ["vegetarian"],
    dietary: { isVegetarian: true, isMild: true },
    image: "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=600&auto=format&fit=crop&q=80"
  },

  // KIDS MENU
  {
    id: "k1",
    name: "Mini Suya Chicken Skewers",
    description: "Very mild, flavorful chicken chunks grilled on skewers with sweet sliced peppers, served with hand-cut local sweet potato fries & pure tomato compote.",
    price: "₦9,500",
    categories: ["kids"],
    dietary: { isKidsFriendly: true, isMild: true },
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "k2",
    name: "Golden Dodo & Cheese Bites",
    description: "Diced ripened local plantains sweet-sautÃ©ed until caramelized, tossed with mild mozzarella cheese cubes and baked crispy, served with fruit skewers.",
    price: "₦8,000",
    categories: ["kids", "vegetarian"],
    dietary: { isKidsFriendly: true, isVegetarian: true, isMild: true },
    image: "https://images.unsplash.com/photo-1566453983492-411db181e194?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "k3",
    name: "Crispy Snapper Goujons",
    description: "Mild white fish fillet portions in crisp cornflake breading, baked fluffy and served with mashed butter yams.",
    price: "₦11,000",
    categories: ["kids"],
    dietary: { isKidsFriendly: true, isMild: true },
    image: "https://images.unsplash.com/photo-1532407191490-e4069098a534?w=600&auto=format&fit=crop&q=80"
  },

  // SUNDAY ROAST SPECIALS
  {
    id: "sun1",
    name: "Imperial Sunday Leg of Lamb",
    description: "Slow wood-roasted whole lamb leg, spiced with honey, local tarragon, garlic, and wild alligator pepper, served with roasted seasonal Lagos root crops (Serves 2-3 beautifully as a family).",
    price: "₦55,000",
    categories: ["sunday"],
    dietary: { isGlutenFree: true },
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sun2",
    name: "Smoked Whole Guinea Fowl roast",
    description: "Local grass-fed guinea fowl, hardwood smoked with scent leaf stuffing, glazed in honey and aged palm wine reduction, served with roasted garden vegetables.",
    price: "₦42,000",
    categories: ["sunday"],
    dietary: { isMild: true },
    image: "https://images.unsplash.com/photo-1598103442097-8b743e2b90ce?w=600&auto=format&fit=crop&q=80"
  },

  // DESSERTS
  {
    id: "d1",
    name: "Agege Bread Butter Pudding",
    description: "Caramelized traditional sweet loaf soaked in Madagascan vanilla custard cream, served with Lagos-harvested wild honey comb and handcrafted ginger-infused white chocolate gelato.",
    price: "₦11,500",
    categories: ["desserts"],
    dietary: { isVegetarian: true, isMild: true, isKidsFriendly: true },
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "d2",
    name: "Smoked Cocoa & Zobo Sphere",
    description: "A delicate shell of 72% dark single-origin Idanre cocoa, cracked table-side to reveal a luscious Zobo-infused (hibiscus flower) berry mousse and sponge.",
    price: "₦13,000",
    categories: ["desserts"],
    dietary: { isVegetarian: true, isMild: true },
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80"
  },

  // COCKTAILS
  {
    id: "c1",
    name: "The Ona Elixir",
    description: "Single-estate Nigerian craft rum, fresh lemongrass extract, cold-pressed sugarcane juice, lime zest, and home-smoked dehydrated ginger essence.",
    price: "₦12,500",
    categories: ["cocktails"],
    dietary: {},
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "c2",
    name: "Eko Dusk (Palm Wine Sour)",
    description: "Traditional fresh palm wine whipped with premium dark rye whiskey, fresh lemon, angostura bitters, and gold leaf dust garnish.",
    price: "₦14,000",
    categories: ["cocktails"],
    dietary: {},
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80"
  },

  // MOCKTAILS
  {
    id: "m1",
    name: "Zobo Hibiscus Crest",
    description: "Sun-dried calyces of local Zobo boiled with cinnamon, cloves, and Lagos field orange juice, carbonated with raw cane honey syrup, served over carved clear ice.",
    price: "₦8,500",
    categories: ["mocktails", "kids"],
    dietary: { isVegetarian: true, isVegan: true, isKidsFriendly: true, isMild: true },
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "m2",
    name: "Palm Sweet Scent",
    description: "Fresh crushed tropical pineapple, fresh botanical scent leaf extraction, cold coconut cloud foam, and dehydrated lime rind.",
    price: "₦9,000",
    categories: ["mocktails", "kids"],
    dietary: { isVegetarian: true, isVegan: true, isKidsFriendly: true, isMild: true },
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80"
  },

  // WINE & CHAMPAGNE
  {
    id: "w1",
    name: "Dom Pérignon Brut",
    description: "Epitome of vintage Champagne. Fresh almond and grapefruit notes, leading to mineral complexity and full, opulent depth.",
    price: "₦780,000 /Bottle",
    categories: ["wine"],
    dietary: {},
    image: "https://images.unsplash.com/photo-1594487528504-4c658b45df4d?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "w2",
    name: "Stags' Leap Napa Valley Cabernet Sauvignon",
    description: "A rich, deeply structured California red wine loaded with notes of dark blackberry, cinnamon butter, and forest soil, matching the Ribeye perfectly.",
    price: "₦210,000 /Bottle - ₦42,000 /Glass",
    categories: ["wine"],
    dietary: {},
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    category: "food",
    title: "Slow-Braised Short Rib Jollof Risotto",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g2",
    category: "drinks",
    title: "The Ona Elixir (Lemongrass Infused Rum)",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g3",
    category: "interior",
    title: "The Main Dining Room & Earth-Weave Booths",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g4",
    category: "outdoor",
    title: "Scent Leaf Courtyard & Garden Lounge",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g5",
    category: "guests",
    title: "Elegant Moments & Celebrations of Life",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g6",
    category: "chef",
    title: "Artisanal Platings in the Open Kitchen",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g7",
    category: "events",
    title: "A Bespoke Marriage Proposal Setup",
    image: "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g8",
    category: "food",
    title: "Atlantic Charcoal Prawn Platter",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "g9",
    category: "drinks",
    title: "Lagos Palm Wine Sour with Gold Flakes",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anthonia Egodi",
    role: "Lagos Culinary Critic",
    comment: "Ona Lagos has completely elevated Victorian Island's gastronomy. The Efo Riro Ravioli is a masterclass in culinary synthesis. A premium experience that feels both deeply familiar and wildly futuristic.",
    rating: 5
  },
  {
    name: "Dr. Kunle Adeleke",
    role: "Family Physician & Gastronome",
    comment: "Finding a fine-dining establishment that respects luxury aesthetic while maintaining genuine warmth and fantastic options for our young children is rare. The team made us feel incredibly welcome.",
    rating: 5
  },
  {
    name: "Michelle Du-Pont",
    role: "International Diplomat & Fine Diner",
    comment: "The scent-leaf smoked rack of lamb is easily one of the best dishes in West Africa. The dark visual design, the gold details, and the curated background music make you feel as though you've traveled inside an immersive work of art.",
    rating: 5
  }
];

export const OPENING_HOURS = [
  { day: "Tuesdays & Thursdays", lunch: "12:30 PM - 3:30 PM", dinner: "6:00 PM - 11:00 PM" },
  { day: "Wednesdays", lunch: "Closed", dinner: "Closed (No Operations)" },
  { day: "Fridays", lunch: "12:30 PM - 4:00 PM", dinner: "6:00 PM - Midnight" },
  { day: "Saturdays", lunch: "11:00 AM - 4:00 PM", dinner: "6:00 PM - Midnight" },
  { day: "Sundays (Sunday Roast Only)", lunch: "11:00 AM - 4:30 PM", dinner: "6:00 PM - 10:30 PM" },
  { day: "Mondays", lunch: "Closed", dinner: "Closed for Private Curations" }
];
