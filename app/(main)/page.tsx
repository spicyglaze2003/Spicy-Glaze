import Hero from "@/components/hero";
import FeaturedProducts from "@/components/featured-products";
import Categories from "@/components/categories";
import BrandStory from "@/components/brand-story";
import ContactSection from "@/components/contact-section";
import type { HeroSlide } from "@/lib/types";
import { getHeroSlides } from "@/lib/api";

async function getSlides(): Promise<HeroSlide[]> {
  try {
    const res = await getHeroSlides();
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const slides = await getSlides();

  return (
    <>
      <Hero slides={slides} />
      <BrandStory />
      <FeaturedProducts />
      <Categories />
      <ContactSection />
    </>
  );
}
