"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedBlob from "./backgrounds/animated-blob";

export default function BrandStory() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gradient-to-br from-peach/40 via-cream to-beige shadow-2xl relative">
              <Image
                src="/assets/brand.jpg"
                alt="Traditional spice preparation"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Floating accent */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-2xl rotate-6 animate-float" />
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-[0.2em]">
              Our Story
            </span>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal leading-tight">
              A Journey of{" "}
              <span className="text-gradient">Authentic Flavours</span>
            </h2>
            <div className="space-y-4 text-charcoal-light/80 leading-relaxed">
              <p>
                Born from a passion for India&apos;s rich culinary heritage,
                SpicyGlaze brings you the finest naturally crafted food products.
                Every jar, every packet is a promise of authenticity.
              </p>
              <p>
                We source the freshest ingredients directly from local farmers
                and artisans, ensuring that every bite carries the true taste of
                tradition. No artificial preservatives, no shortcuts — just pure,
                honest flavours.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { value: "100%", label: "Natural" },
                { value: "50+", label: "Products" },
                { value: "10K+", label: "Happy Customers" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white shadow-sm">
                  <p className="font-[var(--font-playfair)] text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
