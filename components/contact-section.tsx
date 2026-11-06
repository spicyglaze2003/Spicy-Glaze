"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";
import AnimatedBlob from "./backgrounds/animated-blob";

export default function ContactSection() {
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);
  const waMsg = siteConfig.whatsappMessage || "Hi! I'm interested in SpicyGlaze products.";
  const phone = siteConfig.phone || "+91 98765 43210";
  const email = siteConfig.email || "hello@spicyglaze.in";
  return (
    <section className="relative py-24 overflow-hidden">
      <AnimatedBlob className="w-72 h-72 -left-20 top-10 bg-primary/6" color="bg-primary/6" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-[0.2em] mb-4">
            Get in Touch
          </span>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
            Let&apos;s <span className="text-gradient">Connect</span>
          </h2>
          <p className="mt-4 text-charcoal-light/70 max-w-xl mx-auto">
            Have questions? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* WhatsApp */}
          <motion.a
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 text-center hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} className="text-[#25D366]" />
            </div>
            <h3 className="font-semibold text-charcoal mb-1">WhatsApp</h3>
            <p className="text-sm text-muted">Chat with us anytime</p>
          </motion.a>

          {/* Call */}
          <motion.a
            href={`tel:${phone}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 text-center hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Phone size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-charcoal mb-1">Call Us</h3>
            <p className="text-sm text-muted">{phone}</p>
          </motion.a>

          {/* Email */}
          <motion.a
            href="/contact/"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 text-center hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-turmeric/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} className="text-turmeric" />
            </div>
            <h3 className="font-semibold text-charcoal mb-1">Email Us</h3>
            <p className="text-sm text-muted">{email}</p>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
