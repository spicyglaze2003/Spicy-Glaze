import type { Metadata } from "next";
import { BsHeart, BsLeaf, BsStar, BsShieldCheck, BsPeople, BsArrowRight } from "react-icons/bs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the SpicyGlaze story — our journey from a family kitchen to premium naturally crafted food products.",
};

const values = [
  {
    icon: BsLeaf,
    title: "100% Natural",
    description: "No artificial preservatives, colours, or flavours. Just pure, honest ingredients.",
  },
  {
    icon: BsHeart,
    title: "Made with Love",
    description: "Every batch is handcrafted with the care and attention your family deserves.",
  },
  {
    icon: BsShieldCheck,
    title: "Quality Assured",
    description: "FSSAI certified with strict quality controls at every stage of production.",
  },
  {
    icon: BsStar,
    title: "Authentic Taste",
    description: "Recipes passed down through generations, perfected for the modern kitchen.",
  },
];

const stats = [
  { number: "50+", label: "Products" },
  { number: "10K+", label: "Happy Customers" },
  { number: "100%", label: "Natural Ingredients" },
  { number: "5+", label: "Years of Craft" },
];

const timeline = [
  {
    year: "2019",
    title: "The Beginning",
    description: "Started in a small family kitchen with a passion for authentic Indian flavours and a dream to share them with the world.",
  },
  {
    year: "2020",
    title: "First Collection",
    description: "Launched our first line of spice blends and pickles, receiving overwhelming love from our early community.",
  },
  {
    year: "2022",
    title: "Going National",
    description: "Expanded distribution across India, bringing SpicyGlaze to kitchens in every corner of the country.",
  },
  {
    year: "2024",
    title: "Premium Range",
    description: "Introduced our premium artisanal collection, featuring gift sets and specialty blends for the true connoisseur.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige to-cream" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/6 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-turmeric/6 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              Our Story
            </span>
            <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold text-charcoal leading-tight">
              From Our Distributor{" "}
              <span className="text-gradient">to You</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-charcoal-light leading-relaxed max-w-2xl">
              SpicyGlaze was born from a simple belief — that great food starts with great ingredients and honest craftsmanship. We bring you the authentic flavours of India, naturally.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
                Who We Are
              </span>
              <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal leading-tight">
                Crafting Flavours,{" "}
                <span className="text-gradient">Building Trust</span>
              </h2>
              <p className="mt-6 text-charcoal-light leading-relaxed">
                At SpicyGlaze, we are more than just a food brand. We are custodians of flavour, keepers of tradition, and champions of natural goodness. Every product that leaves our kitchen carries with it a promise — of quality, authenticity, and love.
              </p>
              <p className="mt-4 text-charcoal-light leading-relaxed">
                Our team of skilled artisans work closely with local farmers to source the finest ingredients. From hand-picking spices to slow-cooking each batch, we ensure every jar of SpicyGlaze tells a story of care and craftsmanship.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/10 via-beige to-turmeric/10 overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <BsHeart className="text-primary mx-auto mb-4" size={48} />
                  <p className="font-[var(--font-playfair)] text-2xl font-semibold text-charcoal">Made with Love</p>
                  <p className="text-charcoal-light mt-2">Since 2019</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/8 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-turmeric/8 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              Our Values
            </span>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
              What We Stand For
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <value.icon size={28} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-[var(--font-playfair)] text-xl font-semibold text-charcoal mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              Our Journey
            </span>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
              Milestones That Matter
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 mt-2 ring-4 ring-cream z-10" />

                {/* Content */}
                <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                    {item.year}
                  </span>
                  <h3 className="font-[var(--font-playfair)] text-xl font-semibold text-charcoal mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Taste the Difference
          </h2>
          <p className="text-lg text-charcoal-light mb-10 max-w-2xl mx-auto">
            Experience the love and craftsmanship in every bite. Explore our collection and discover your new favourites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-base font-medium hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              Explore Products
              <BsArrowRight size={16} />
            </Link>
            <Link
              href="/contact/"
              className="inline-flex items-center justify-center gap-2 border-2 border-charcoal/20 text-charcoal px-8 py-4 rounded-full text-base font-medium hover:border-primary hover:text-primary transition-all duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Team / Philosophy */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-beige via-cream to-primary/5 overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <BsPeople className="text-primary mx-auto mb-4" size={56} />
                  <p className="font-[var(--font-playfair)] text-2xl font-semibold text-charcoal mt-4">Our Team</p>
                  <p className="text-charcoal-light mt-2 text-sm">Passionate food artisans</p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
                Our Philosophy
              </span>
              <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal leading-tight">
                Simplicity is the{" "}
                <span className="text-gradient">Ultimate Sophistication</span>
              </h2>
              <p className="mt-6 text-charcoal-light leading-relaxed">
                We believe that the best food doesn&apos;t need complexity. It needs integrity. Every ingredient in our products has a purpose, every process has been refined, and every flavour tells a story.
              </p>
              <p className="mt-4 text-charcoal-light leading-relaxed">
                Our commitment to natural goodness means you can trust what you&apos;re feeding your family. No shortcuts, no compromises &mdash; just honest food made the way it should be.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <BsShieldCheck className="text-leaf" size={18} />
                  FSSAI Certified
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <BsLeaf className="text-leaf" size={18} />
                  Organic Ingredients
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <BsHeart className="text-primary" size={18} />
                  Family Recipes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
