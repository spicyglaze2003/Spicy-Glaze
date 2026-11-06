"use client";

import { useState } from "react";
import { BsWhatsapp, BsInstagram, BsFacebook, BsSend, BsCheckCircle } from "react-icons/bs";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { config } from "@/lib/config";
import { submitContactForm } from "@/lib/api";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";

export default function ContactPage() {
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);
  const waMsg = siteConfig.whatsappMessage || "Hi! I have a question about SpicyGlaze products.";
  const phone = siteConfig.phone || "+91 98765 43210";
  const email = siteConfig.email || "hello@spicyglaze.in";
  const address = siteConfig.address || "India";

  const contactInfo = [
    {
      icon: BsWhatsapp,
      title: "WhatsApp",
      value: waNum,
      href: `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`,
      color: "bg-leaf/10 text-leaf",
    },
    {
      icon: HiOutlineMail,
      title: "Email",
      value: email,
      href: `mailto:${email}`,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: HiOutlinePhone,
      title: "Phone",
      value: phone,
      href: `tel:${phone}`,
      color: "bg-turmeric/10 text-turmeric",
    },
    {
      icon: HiOutlineLocationMarker,
      title: "Location",
      value: address,
      href: "#",
      color: "bg-coral/10 text-coral",
    },
  ];

  const socials = [
    { icon: BsInstagram, href: siteConfig.instagramUrl || "https://instagram.com", label: "Instagram", color: "hover:bg-pink-500", show: !!siteConfig.instagramUrl },
    { icon: BsFacebook, href: siteConfig.facebookUrl || "https://facebook.com", label: "Facebook", color: "hover:bg-blue-600", show: !!siteConfig.facebookUrl },
    { icon: BsWhatsapp, href: `https://wa.me/${waNum}`, label: "WhatsApp", color: "hover:bg-leaf", show: true },
  ].filter(s => s.show);

  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    try {
      await submitContactForm(formData);
      setFormState("sent");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setFormState("idle"), 4000);
    } catch {
      setFormState("idle");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige to-cream" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/6 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-leaf/6 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              Get in Touch
            </span>
            <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold text-charcoal leading-tight">
              We&apos;d Love to{" "}
              <span className="text-gradient">Hear from You</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-charcoal-light leading-relaxed max-w-2xl">
              Have a question, feedback, or just want to say hello? We&apos;re here and ready to help. Reach out through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-cream rounded-3xl p-8 text-center hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={28} />
                </div>
                <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                <p className="text-sm text-charcoal-light">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
                <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-charcoal mb-2">
                  Send Us a Message
                </h2>
                <p className="text-charcoal-light mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-cream border border-border text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-cream border border-border text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-cream border border-border text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Product inquiry, feedback, collaboration..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-cream border border-border text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-base font-medium hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {formState === "sending" ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : formState === "sent" ? (
                      <>
                        <BsCheckCircle size={18} />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <BsSend size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              {/* WhatsApp CTA */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-charcoal mb-4">
                  Quick Chat
                </h3>
                <p className="text-charcoal-light mb-6">
                  Need an instant reply? Chat with us directly on WhatsApp. We&apos;re usually online during business hours.
                </p>
                <a
                  href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-leaf text-white px-6 py-4 rounded-full text-base font-medium hover:bg-leaf/90 transition-all duration-300 shadow-lg shadow-leaf/20 hover:shadow-xl hover:shadow-leaf/30 w-full"
                >
                  <BsWhatsapp size={20} />
                  Start WhatsApp Chat
                </a>
              </div>

              {/* Social */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-charcoal mb-4">
                  Follow Us
                </h3>
                <p className="text-charcoal-light mb-6">
                  Stay connected and be the first to know about new products, recipes, and exclusive offers.
                </p>
                <div className="flex gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full bg-cream flex items-center justify-center text-charcoal-light hover:text-white transition-all duration-300 ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-charcoal mb-4">
                  Business Hours
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between text-sm">
                    <span className="text-charcoal-light">Monday - Friday</span>
                    <span className="font-medium text-charcoal">9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-charcoal-light">Saturday</span>
                    <span className="font-medium text-charcoal">10:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-charcoal-light">Sunday</span>
                    <span className="font-medium text-charcoal">Closed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-80 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-primary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <HiOutlineLocationMarker className="text-primary mx-auto mb-4" size={48} />
            <p className="font-[var(--font-playfair)] text-2xl font-semibold text-white mb-2">Our Location</p>
            <p className="text-white/60">{address}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
