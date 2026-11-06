"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroSlide } from "@/lib/types";
import { getStrapiMedia } from "@/lib/utils";
import FloatingParticles from "./backgrounds/floating-particles";
import AnimatedBlob from "./backgrounds/animated-blob";

interface HeroProps {
  slides: HeroSlide[];
}

export default function Hero({ slides }: HeroProps) {
  const slide = slides?.[0];
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-32">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            100% Natural Ingredients
          </motion.div>

          <h1 className="font-[var(--font-playfair)] text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            {slide?.title || (
              <>
                Naturally Crafted
                <br />
                <span className="text-gradient">Goodness</span>
              </>
            )}
          </h1>

          <p className="text-lg text-charcoal-light/80 max-w-lg leading-relaxed">
            {slide?.subtitle ||
              "Packed with authentic flavours. Every product is a celebration of India's rich culinary heritage, crafted with love and the finest natural ingredients."}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Explore Products
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border-2 border-charcoal/15 text-charcoal px-7 py-3.5 rounded-full font-medium hover:border-primary hover:text-primary transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </motion.div>

        {/* Right: Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative flex justify-center"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl animate-pulse-soft" />

            {/* Image Container */}
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden bg-gradient-to-br from-peach/40 to-cream shadow-2xl animate-float">
              {slide?.image ? (
                <Image
                  src={getStrapiMedia(slide.image.url)}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              ) : (
                <Image
                  src="/assets/hero.jpg"
                  alt="Premium artisanal spices"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              )}
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-lg"
            >
              <p className="text-xs text-muted">Authentic</p>
              <p className="font-semibold text-sm">Indian Flavours</p>
            </motion.div>

            {/* Floating Badge 2 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-lg"
            >
              <p className="text-xs text-muted">Since</p>
              <p className="font-semibold text-sm">2024</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-charcoal/20 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
