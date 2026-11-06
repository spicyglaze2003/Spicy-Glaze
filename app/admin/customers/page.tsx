"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Plus,
  Eye,
  Trash2,
  X,
  FileText,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { toast } from "sonner";
import {
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
} from "@/lib/admin-api";
import type { Customer, CustomerSegment, Order } from "@/lib/admin-types";
import { formatPrice } from "@/lib/utils";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment>("all");

  // CRM Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State for Add Customer
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustCity, setNewCustCity] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustSegment, setNewCustSegment] = useState<CustomerSegment>("new");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", search, segmentFilter],
    queryFn: () => getAdminCustomers({ search: search || undefined, segment: segmentFilter !== "all" ? segmentFilter : undefined }),
  });

  const { data: allCustomersData } = useQuery({
    queryKey: ["admin-customers-all"],
    queryFn: () => getAdminCustomers(),
  });

  const customers: Customer[] = data?.data || [];
  const allCustomers: Customer[] = allCustomersData?.data || customers;

  // CRM Metrics
  const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrders = allCustomers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const vipCount = allCustomers.filter((c) => c.segment === "vip").length;

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createAdminCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers-all"] });
      toast.success("Customer added to CRM successfully!");
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to create customer");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdminCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers-all"] });
      toast.success("Customer removed from CRM");
      setSelectedCustomer(null);
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const resetForm = () => {
    setNewCustName("");
    setNewCustEmail("");
    setNewCustPhone("");
    setNewCustCity("");
    setNewCustAddress("");
    setNewCustSegment("new");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    createMutation.mutate({
      name: newCustName.trim(),
      email: newCustEmail.trim() || `${newCustName.toLowerCase().replace(/[^a-z0-9]/g, "")}@spicyglaze.in`,
      phone: newCustPhone.trim() || null,
      segment: newCustSegment,
      address: {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        line1: newCustAddress.trim(),
        city: newCustCity.trim() || "Erode",
        state: "Tamil Nadu",
        pincode: "638001",
        country: "India",
      },
    });
  };

  const handleDirectWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, "");
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    const msg = `Hello ${name}! Reaching out from SpicyGlaze regarding your customer account.`;
    window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Users className="text-orange-500" />
            Customer CRM Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer relationship metrics, lifetime spending, order histories, and communication.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* CRM Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Customers
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
            {allCustomers.length}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Recorded profiles</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Lifetime Revenue
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">
            {formatPrice(totalRevenue)}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{totalOrders} orders completed</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Avg. Order Value
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-orange-600 mt-1">
            {formatPrice(avgOrderValue)}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Per customer order</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            VIP Customers
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-1">
            {vipCount}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">₹5,000+ spend tier</span>
        </div>
      </div>

      {/* Filter / Search Bar & Segment Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Segment Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "vip", "repeat", "new"] as CustomerSegment[]).map((seg) => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                segmentFilter === seg
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {seg === "all" ? "All Customers" : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customers List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            <p className="text-gray-400 mt-2 text-xs">Loading customer CRM profiles...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No customers found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try modifying your search or filter options.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Contact & WhatsApp</th>
                    <th className="py-3.5 px-6">Tier</th>
                    <th className="py-3.5 px-6">Orders</th>
                    <th className="py-3.5 px-6">Total Spent</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{cust.name}</p>
                            <p className="text-xs text-gray-400 font-mono">ID: #{cust.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="text-xs text-gray-700 flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.email}</span>
                        </div>
                        {cust.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Phone size={13} className="text-gray-400" />
                              {cust.phone}
                            </span>
                            <button
                              onClick={() => handleDirectWhatsApp(cust.phone!, cust.name)}
                              className="text-leaf hover:text-leaf/80 p-1 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <BsWhatsapp size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cust.segment === "vip"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : cust.segment === "repeat"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {cust.segment}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">
                          <ShoppingBag size={13} className="text-gray-500" />
                          {cust.totalOrders} {cust.totalOrders === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatPrice(cust.totalSpent || 0)}
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove customer "${cust.name}" from CRM directory?`)) {
                              deleteMutation.mutate(String(cust.id));
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete customer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< md) */}
            <div className="md:hidden divide-y divide-gray-100">
              {customers.map((cust) => (
                <div key={cust.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{cust.name}</p>
                        <p className="text-xs text-gray-400">{cust.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cust.segment === "vip"
                          ? "bg-purple-50 text-purple-700"
                          : cust.segment === "repeat"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cust.segment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Orders</span>
                      <span className="font-bold text-gray-800">{cust.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Spent</span>
                      <span className="font-bold text-emerald-700">{formatPrice(cust.totalSpent || 0)}</span>
                    </div>
                    {cust.phone && (
                      <button
                        onClick={() => handleDirectWhatsApp(cust.phone!, cust.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-leaf text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                      >
                        <BsWhatsapp size={12} /> WhatsApp
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-400 font-mono">ID: #{cust.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${cust.name}"?`)) {
                            deleteMutation.mutate(String(cust.id));
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer CRM Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{selectedCustomer.name}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold capitalize">
                    {selectedCustomer.segment} Tier Client
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider">
                    Total Volume
                  </span>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">
                    {selectedCustomer.totalOrders} Orders
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
                    Lifetime Spend
                  </span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">
                    {formatPrice(selectedCustomer.totalSpent || 0)}
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Contact Information
                </h4>
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <button
                        onClick={() => handleDirectWhatsApp(selectedCustomer.phone!, selectedCustomer.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-leaf text-white rounded-lg font-bold text-xs cursor-pointer shadow-sm"
                      >
                        <BsWhatsapp size={12} /> Message
                      </button>
                    </div>
                  )}
                  {selectedCustomer.address?.line1 && (
                    <div className="flex items-start gap-2 pt-1 border-t border-gray-200/50">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {selectedCustomer.address.line1}, {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.pincode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (confirm(`Remove customer "${selectedCustomer.name}"?`)) {
                      deleteMutation.mutate(String(selectedCustomer.id));
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  <Trash2 size={13} /> Delete Profile
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Users size={20} className="text-orange-500" />
                Add New CRM Customer
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Tier
                  </label>
                  <select
                    value={newCustSegment}
                    onChange={(e) => setNewCustSegment(e.target.value as CustomerSegment)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="repeat">Repeat</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  placeholder="e.g. Erode / Chennai / Bangalore"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Delivery Address / Notes
                </label>
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Street, locality, landmark..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
