import type {
  Product,
  Category,
  Subcategory,
  HeroSlide,
  Testimonial,
  GalleryItem,
  SiteSetting,
} from "./types";

export const demoCategories: Category[] = [
  {
    id: 1,
    documentId: "cat-1",
    name: "Artisanal Spices",
    slug: "artisanal-spices",
    rank: 1,
    description: "Stone-ground, single-origin whole and blended spices from Western Ghats and Kashmir.",
    image: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
  {
    id: 2,
    documentId: "cat-2",
    name: "Wild Forest Honey",
    slug: "wild-forest-honey",
    rank: 2,
    description: "Raw, unprocessed forest nectar infused with floral blossoms and royal saffron.",
    image: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
  {
    id: 3,
    documentId: "cat-3",
    name: "Handcrafted Pickles",
    slug: "handcrafted-pickles",
    rank: 3,
    description: "Sun-cured traditional Indian pickles aged in cold-pressed mustard and sesame oil.",
    image: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
  {
    id: 4,
    documentId: "cat-4",
    name: "Cold-Pressed Oils",
    slug: "cold-pressed-oils",
    rank: 4,
    description: "Traditional wooden kachi ghani extracted oils preserving natural vitamins and aromas.",
    image: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
];

export const demoSubcategories: Subcategory[] = [
  {
    id: 1,
    documentId: "sub-1",
    name: "Whole Peppercorns",
    slug: "whole-peppercorns",
    rank: 1,
    description: null,
    image: null,
    category: demoCategories[0],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
  {
    id: 2,
    documentId: "sub-2",
    name: "Raw Monofloral Honey",
    slug: "raw-monofloral-honey",
    rank: 2,
    description: null,
    image: null,
    category: demoCategories[1],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
];

export const demoProducts: Product[] = [];

export const demoHeroSlides: HeroSlide[] = [
  {
    id: 1,
    documentId: "slide-1",
    title: "Naturally Crafted Indian Goodness",
    subtitle: "Authentic spices, wild forest honey and traditional stone-ground recipes crafted with love.",
    image: null,
    ctaText: "Explore Products",
    ctaLink: "/products",
    rank: 1,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
  {
    id: 2,
    documentId: "slide-2",
    title: "Pure GI-Tagged Kashmiri Saffron Honey",
    subtitle: "Hand-harvested raw floral nectar steeped with premium saffron threads.",
    image: null,
    ctaText: "Order on WhatsApp",
    ctaLink: "/products",
    rank: 2,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    publishedAt: "2026-01-01",
  },
];

export const demoTestimonials: Testimonial[] = [];

export const demoGallery: GalleryItem[] = [];

export const demoSiteSetting: SiteSetting = {
  id: 1,
  documentId: "cfg-1",
  siteName: "spicyglaze",
  siteTagline: "Naturally Crafted Goodness",
  whatsappNumber: "917305256022",
  whatsappMessage: "Hi! I would like to order spicyglaze handcrafted foods.",
  email: "spicyglazesupport@gmail.com",
  phone: "7305256022",
  address: "Erode - 638004 ,Tamilnadu",
  instagramUrl: "https://instagram.com/spicyglaze.in",
  facebookUrl: "https://facebook.com/spicyglazeEco",
  twitterUrl: null,
  aboutText: "spicyglaze crafts premium natural Indian packaged foods using heirloom spices, pure forest honey and traditional processing techniques.",
  logo: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  publishedAt: "2026-01-01",
};
