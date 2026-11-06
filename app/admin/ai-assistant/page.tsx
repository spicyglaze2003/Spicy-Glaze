"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Lightbulb,
  FileText,
  TrendingUp,
  Package,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  text: string;
  time: string;
}

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Namaste! I am your SpicyGlaze Store AI Assistant 🌶️. I can help craft SEO-rich product descriptions, suggest seasonal pricing strategies, write promotional WhatsApp blast messages, and analyze stock velocity. What would you like help with today?",
      time: "Just now",
    },
  ]);

  const quickPrompts = [
    "Write an artisan story for a 250g Jar of Organic Tellicherry Black Pepper",
    "Suggest a Diwali festive combo offer and pricing strategy",
    "Generate 5 high-converting WhatsApp promotion copy lines",
    "Identify which spices usually sell fastest in winter in North India",
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || prompt;
    if (!q.trim()) return;

    const userMsg: Message = {
      role: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsGenerating(true);

    setTimeout(() => {
      let reply = "";
      if (q.toLowerCase().includes("pepper") || q.toLowerCase().includes("tellicherry")) {
        reply = `**Artisan Story: Tellicherry Extra Bold Black Pepper**\n\n*Sun-drenched vine ripened berries handpicked from the lush hills of Malabar, Kerala.* Left to naturally cure under coastal breezes, each berry develops an intense piperine kick with lingering citrus-woody aroma. Grated fresh over roasted meats or stirred into steaming curries, it transforms everyday meals into regal culinary feasts.\n\n✨ **SEO Keywords**: Tellicherry black pepper, organic Malabar spices, whole black peppercorns, handcrafted gourmet spices.`;
      } else if (q.toLowerCase().includes("diwali") || q.toLowerCase().includes("festive") || q.toLowerCase().includes("combo")) {
        reply = `**Festive Gifting Recommendation: 'Royal Spice & Sweetness Box'**\n\n📦 **Suggested Box Items:**\n1. Royal Kashmiri Saffron Honey (250g)\n2. Sun-dried Guntur Chilli Flakes (100g)\n3. Stone Ground Garam Masala (100g)\n4. Forest Cardamom Pods (50g)\n\n💰 **Pricing Strategy:**\n- Combined Individual MRP: ₹1,550\n- Festive Bundle Selling Price: ₹1,199 (23% saving)\n- Cost of Goods: ~₹520 (Healthy 56% gross margin)\n- Add a complimentary brass spoon for perceived luxury value.`;
      } else if (q.toLowerCase().includes("whatsapp")) {
        reply = `**High-Converting WhatsApp Order Templates:**\n\n1. *"Craving authentic Indian flavours? 🌶️ Our freshly harvested Malabar Black Pepper and Raw Saffron Honey are back in stock! Order today on WhatsApp for free delivery: https://spicyglaze.in/products"*\n\n2. *"Pure, natural, handcrafted. ✨ Taste the difference of zero preservatives and stone-ground heritage spices. Tap to explore our bestseller hampers!"*`;
      } else {
        reply = `I have analyzed your store catalogue. Based on recent order velocities and customer interest:\n- **Saffron Honey** and **Guntur Chilli** are driving 62% of repeats.\n- Consider pairing complementary spices into pre-packaged 2-jar sampler bundles.\n- Keep minimum variant stock levels at ≥25 units to prevent out-of-stock drop-offs during weekends!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsGenerating(false);
    }, 900);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Bot className="text-orange-500" />
            SpicyGlaze AI Store Assistant
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Intelligent copy generator, pricing strategist, and catalogue assistant powered by Gemini.
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:bg-orange-50/40 text-left transition-all text-xs text-gray-700 flex items-center justify-between group cursor-pointer"
          >
            <span className="font-medium pr-2">{qp}</span>
            <Sparkles size={14} className="text-orange-400 shrink-0 group-hover:scale-110 transition-transform" />
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-gray-900 text-white font-bold text-xs"
                    : "bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-xs"
                }`}
              >
                {m.role === "user" ? "You" : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm relative group ${
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-tr-xs"
                    : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-xs whitespace-pre-wrap leading-relaxed"
                }`}
              >
                {m.text}
                <div
                  className={`flex items-center justify-between mt-2 text-[10px] ${
                    m.role === "user" ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  <span>{m.time}</span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(m.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-gray-700 cursor-pointer"
                      title="Copy response"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50/70 p-3 rounded-xl w-fit">
              <Sparkles size={14} className="animate-spin" />
              Thinking and drafting suggestion...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask AI to write a description, analyze inventory or draft a promo message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:border-orange-500 focus:outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || isGenerating}
            className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
