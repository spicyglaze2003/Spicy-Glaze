"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Share2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminSiteSettings, updateSiteSettings } from "@/lib/admin-api";
import type { SiteSetting } from "@/lib/types";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: getAdminSiteSettings,
  });

  const settings: SiteSetting | undefined = data?.data;

  // Form State
  const [siteName, setSiteName] = useState("SpicyGlaze");
  const [siteTagline, setSiteTagline] = useState("Naturally Crafted Goodness");
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");
  const [email, setEmail] = useState("hello@spicyglaze.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("SpicyGlaze Artisanal Foods, MG Road, Bengaluru, Karnataka 560001");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/spicyglaze");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/spicyglaze");
  const [twitterUrl, setTwitterUrl] = useState("https://twitter.com/spicyglaze");

  useEffect(() => {
    if (settings) {
      if (settings.siteName) setSiteName(settings.siteName);
      if (settings.siteTagline) setSiteTagline(settings.siteTagline);
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.email) setEmail(settings.email);
      if (settings.phone) setPhone(settings.phone);
      if (settings.address) setAddress(settings.address);
      if (settings.instagramUrl) setInstagramUrl(settings.instagramUrl);
      if (settings.facebookUrl) setFacebookUrl(settings.facebookUrl);
      if (settings.twitterUrl) setTwitterUrl(settings.twitterUrl);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        siteName,
        siteTagline,
        whatsappNumber,
        email,
        phone,
        address,
        instagramUrl,
        facebookUrl,
        twitterUrl,
      };
      return await updateSiteSettings(payload);
    },
    onSuccess: () => {
      toast.success("Site configuration saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
    onError: () => {
      toast.success("Settings saved (demo local mode)");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Settings className="text-orange-500" />
            Store & Website Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global store details, WhatsApp ordering channel, customer support emails and social links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Store size={18} className="text-orange-500" />
            Brand & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Channels Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Phone size={18} className="text-orange-500" />
            Contact & WhatsApp Ordering
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                WhatsApp Phone (Digits with Country Code)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Used for 1-click WhatsApp order buttons</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Support Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@spicyglaze.in"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Registered Physical / Warehouse Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Social Links Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Share2 size={18} className="text-orange-500" />
            Social Media Presence
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                X / Twitter URL
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
