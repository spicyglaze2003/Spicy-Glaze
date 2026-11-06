"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Search,
  User,
  Activity,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { ActivityLog, ActivityAction } from "@/lib/admin-types";

const actionStyles: Partial<
  Record<ActivityAction, { bg: string; text: string; icon: React.ElementType }>
> = {
  create: { bg: "bg-emerald-50", text: "text-emerald-800", icon: PlusCircle },
  update: { bg: "bg-blue-50", text: "text-blue-800", icon: Edit },
  delete: { bg: "bg-red-50", text: "text-red-800", icon: Trash2 },
  login: { bg: "bg-purple-50", text: "text-purple-800", icon: CheckCircle },
  logout: { bg: "bg-gray-50", text: "text-gray-800", icon: CheckCircle },
  publish: { bg: "bg-emerald-50", text: "text-emerald-800", icon: CheckCircle },
  unpublish: { bg: "bg-amber-50", text: "text-amber-800", icon: Activity },
  "price-update": { bg: "bg-orange-50", text: "text-orange-800", icon: Activity },
  "order-status-update": { bg: "bg-teal-50", text: "text-teal-800", icon: CheckCircle },
  "stock-update": { bg: "bg-amber-50", text: "text-amber-800", icon: Activity },
};

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: async () => {
      try {
        const res = await api.get("/activity-logs");
        return res.data;
      } catch {
        return { data: [] };
      }
    },
  });

  const logs: ActivityLog[] = data?.data || [];

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.adminUser.name.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ClipboardList className="text-orange-500" />
            System Activity Logs & Audit Trail
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all administrative edits, price adjustments, inventory changes and order operations.
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
            placeholder="Search activity records..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["all", "price-update", "create", "order-status-update", "stock-update"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                actionFilter === act
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {act.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading activity records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No activity logs recorded</h3>
            <p className="text-xs text-gray-500 mt-1">
              New actions taken across products, orders, and users will be automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Resource / Entity</th>
                  <th className="py-3.5 px-6">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((log) => {
                  const defaultStyle = { bg: "bg-gray-50", text: "text-gray-800", icon: Activity };
                  const style = actionStyles[log.action] || defaultStyle;
                  const Icon = style.icon;

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          {log.adminUser.name}
                        </div>
                        <div className="text-xs text-gray-400">{log.adminUser.email}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${style.bg} ${style.text}`}
                        >
                          <Icon size={12} />
                          {log.action.replace("-", " ")}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{log.entity}</div>
                        <div className="text-xs text-gray-400 font-mono">ID: #{log.entityId}</div>
                      </td>

                      <td className="py-4 px-6 text-xs text-gray-600 max-w-sm">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
