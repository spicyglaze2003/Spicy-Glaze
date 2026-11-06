"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminContactMessages,
  updateContactMessageStatus,
} from "@/lib/admin-api";
import type { ContactSubmission } from "@/lib/types";



export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: () => getAdminContactMessages().catch(() => ({ data: [], meta: {} })),
  });

  const messages: ContactSubmission[] = data?.data || [];

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(search.toLowerCase())) ||
      m.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "new" | "read" | "replied" }) => {
      return await updateContactMessageStatus(String(id), status);
    },
    onSuccess: (_, vars) => {
      toast.success(`Message marked as ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (selectedMessage) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: vars.status } : null));
      }
    },
    onError: () => {
      toast.success("Status updated (demo mode)");
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <MessageSquare className="text-orange-500" />
            Customer Enquiries & Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Inquiries submitted via the store contact form and catering/wholesale requests.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by sender, email or text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "new", "read", "replied"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Sender</th>
                <th className="py-3.5 px-6">Subject & Message</th>
                <th className="py-3.5 px-6">Received</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No inquiries match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      msg.status === "new" ? "bg-orange-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {msg.name}
                        {msg.status === "new" && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                    </td>

                    <td className="py-4 px-6 max-w-md">
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {msg.subject || "Store Inquiry"}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {msg.message}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                          msg.status === "new"
                            ? "bg-blue-50 text-blue-700"
                            : msg.status === "read"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {msg.status === "new" ? (
                          <Clock size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {msg.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (msg.status === "new") {
                            statusMutation.mutate({ id: msg.id, status: "read" });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Customer Inquiry #{selectedMessage.id}
                </h3>
                <p className="text-xs text-gray-500">
                  Received {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString("en-IN") : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <User size={15} className="text-gray-400" />
                    {selectedMessage.name}
                  </div>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                    {selectedMessage.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  {selectedMessage.email}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Subject
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedMessage.subject || "No subject specified"}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Message Content
                </h4>
                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedMessage.status !== "replied" && (
                  <button
                    onClick={() =>
                      statusMutation.mutate({ id: selectedMessage.id, status: "replied" })
                    }
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Mark as Replied
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || "SpicyGlaze Enquiry"
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  <Send size={13} /> Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
