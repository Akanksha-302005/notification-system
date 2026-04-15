"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  MessageCircle,
  Users,
  Bell,
  Calendar,
  Upload,
  FileSpreadsheet,
  Send,
  LogOut,
  Search,
  Sparkles,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalEmails: 0,
    todayEmails: 0,
    emailCount: 0,
    whatsappCount: 0,
  });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [phone, setPhone] = useState("");

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
      setStats(
        data.stats || {
          totalUsers: 0,
          totalEmails: 0,
          todayEmails: 0,
          emailCount: 0,
          whatsappCount: 0,
        }
      );
    } catch {
      setToast({ type: "error", message: "Failed to load dashboard data" });
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchLogs();
  }, [status]);

  const buildMessage = () =>
    customMessage || `🎉 Happy Birthday ${name}! Wishing you happiness and success!`;

  const handleSendEmail = async () => {
    if (!email || !name) {
      setToast({ type: "error", message: "Please enter recipient name and email" });
      return;
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "birthday", customMessage: buildMessage(), name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: "error", message: data.message || "Failed to send email" });
        return;
      }

      setToast({ type: "success", message: data.message || "Email sent successfully" });
      fetchLogs();
    } catch {
      setToast({ type: "error", message: "Something went wrong while sending email" });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phone || !name) {
      setToast({ type: "error", message: "Please enter recipient name and phone" });
      return;
    }

    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: buildMessage() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: "error", message: data.message || "Failed to send WhatsApp" });
        return;
      }

      setToast({ type: "success", message: data.message || "WhatsApp sent successfully" });
      fetchLogs();
    } catch {
      setToast({ type: "error", message: "Something went wrong while sending WhatsApp" });
    }
  };

  const handleSendBoth = async () => {
    if (!name || !email || !phone) {
      setToast({
        type: "error",
        message: "Please enter name, email and phone to send both",
      });
      return;
    }

    await handleSendEmail();
    await handleSendWhatsApp();

    setEmail("");
    setPhone("");
    setName("");
    setCustomMessage("");
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const matchesSearch =
        (log.email || log.phone || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (log.message || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.channel || "").toLowerCase().includes(search.toLowerCase());

      const matchesChannel =
        channelFilter === "all" ? true : log.channel === channelFilter;

      return matchesSearch && matchesChannel;
    });
  }, [logs, search, channelFilter]);

  const channelChartData = [
    { name: "Email", value: Number(stats.emailCount || 0) },
    { name: "WhatsApp", value: Number(stats.whatsappCount || 0) },
  ];

  const totalChannelMessages =
    Number(stats.emailCount || 0) + Number(stats.whatsappCount || 0);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#07111f] flex items-center justify-center text-white">
        <div className="text-lg font-medium animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                : "border-rose-400/40 bg-rose-500/20 text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200 mb-4">
                  <Sparkles size={14} />
                  Smart Notification Center
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
                  Notification Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-300">
                  Send email and WhatsApp notifications, manage bulk uploads, and track
                  activity through a high-visibility analytics dashboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                  <Activity size={18} className="text-cyan-300" />
                  <span className="text-sm">Live activity panel</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 px-5 py-3 text-white font-semibold shadow-lg shadow-fuchsia-900/30 hover:scale-[1.02] transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8"
        >
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users size={22} />}
            iconWrap="from-indigo-500 to-cyan-500"
            glow="shadow-cyan-500/10"
          />
          <StatCard
            title="Total Notifications"
            value={stats.totalEmails}
            icon={<Bell size={22} />}
            iconWrap="from-violet-500 to-fuchsia-500"
            glow="shadow-fuchsia-500/10"
          />
          <StatCard
            title="Sent Today"
            value={stats.todayEmails}
            icon={<Calendar size={22} />}
            iconWrap="from-pink-500 to-rose-500"
            glow="shadow-pink-500/10"
          />
          <StatCard
            title="Email Sent"
            value={stats.emailCount}
            icon={<Mail size={22} />}
            iconWrap="from-sky-500 to-blue-600"
            glow="shadow-blue-500/10"
          />
          <StatCard
            title="WhatsApp Sent"
            value={stats.whatsappCount}
            icon={<MessageCircle size={22} />}
            iconWrap="from-emerald-500 to-green-600"
            glow="shadow-emerald-500/10"
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8"
        >
          <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Channel Comparison</h2>
                <p className="text-sm text-slate-300">
                  Compare the number of notifications sent by each channel
                </p>
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    <Cell fill="#38bdf8" />
                    <Cell fill="#22c55e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg">
                <PieChartIcon size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Channel Share</h2>
                <p className="text-sm text-slate-300">
                  Distribution of Email and WhatsApp notifications
                </p>
              </div>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    <Cell fill="#38bdf8" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Total channel notifications</p>
              <p className="mt-1 text-3xl font-black text-white">{totalChannelMessages}</p>
            </div>
          </div>
        </motion.div>

        {/* Main panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Send form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-900/30">
                <Send size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Send Notifications</h2>
                <p className="text-sm text-slate-300">
                  Send one message or deliver through both channels instantly
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Recipient Name"
                placeholder="Enter full name"
                value={name}
                onChange={setName}
              />
              <Field
                label="Recipient Email"
                placeholder="Enter email address"
                value={email}
                onChange={setEmail}
                type="email"
              />
              <div className="md:col-span-2">
                <Field
                  label="Recipient Phone"
                  placeholder="Enter WhatsApp number"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Custom Message
              </label>
              <textarea
                rows={5}
                placeholder="Write your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none backdrop-blur-xl focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/30 resize-none transition"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <GlowButton
                onClick={handleSendEmail}
                className="from-sky-500 to-blue-600"
                label="Send Email"
              />
              <GlowButton
                onClick={handleSendWhatsApp}
                className="from-emerald-500 to-green-600"
                label="Send WhatsApp"
              />
              <GlowButton
                onClick={handleSendBoth}
                className="from-violet-500 to-fuchsia-600"
                label="Send Both"
              />
            </div>
          </motion.div>

          {/* Upload */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/30">
                <Upload size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Bulk Upload</h2>
                <p className="text-sm text-slate-300">
                  Import contacts from Excel for faster messaging
                </p>
              </div>
            </div>

            <label className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-cyan-300/30 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 px-6 text-center transition hover:border-cyan-300/50 hover:from-cyan-500/15 hover:to-fuchsia-500/15">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg backdrop-blur-xl">
                <FileSpreadsheet className="text-cyan-200" size={30} />
              </div>

              {!selectedFile ? (
                <>
                  <p className="text-lg font-semibold text-white">
                    Drop or upload Excel file
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Only .xlsx supported
                  </p>
                </>
              ) : (
                <>
                  <p className="max-w-full break-all text-base font-semibold text-cyan-100">
                    {selectedFile}
                  </p>
                  {uploading && (
                    <p className="mt-3 text-sm text-cyan-200 animate-pulse">Uploading...</p>
                  )}
                  {!uploading && uploadSuccess && (
                    <p className="mt-3 text-sm text-emerald-300">Upload successful</p>
                  )}
                </>
              )}

              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    setSelectedFile(file.name);
                    setUploading(true);
                    setUploadSuccess(false);

                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("/api/bulk-send", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      setToast({
                        type: "error",
                        message: data.message || "Bulk upload failed",
                      });
                      setUploading(false);
                      return;
                    }

                    setUploading(false);
                    setUploadSuccess(true);
                    setToast({
                      type: "success",
                      message: data.message || "Bulk upload completed successfully",
                    });
                    fetchLogs();

                    setTimeout(() => {
                      setUploadSuccess(false);
                      setSelectedFile(null);
                    }, 3000);
                  } catch {
                    setUploading(false);
                    setToast({
                      type: "error",
                      message: "Something went wrong during file upload",
                    });
                  }
                }}
              />
            </label>
          </motion.div>
        </div>

        {/* Logs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Notification Logs</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Track recent email and WhatsApp delivery activity
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search recipient or message"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="all" className="bg-slate-900">All Channels</option>
                  <option value="email" className="bg-slate-900">Email</option>
                  <option value="whatsapp" className="bg-slate-900">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Recipient</th>
                  <th className="px-6 py-4 text-left font-semibold">Channel</th>
                  <th className="px-6 py-4 text-left font-semibold">Message</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Sent At</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any, index: number) => {
                    const isSuccess =
                      log.status === "success" || log.status === "sent";

                    return (
                      <tr
                        key={log.id}
                        className={`border-t border-white/5 transition hover:bg-white/5 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <td className="px-6 py-4 text-slate-100">{log.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                          {log.email || log.phone}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                            {log.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-sm truncate text-slate-300">
                          {log.message}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isSuccess
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                                : "bg-rose-500/15 text-rose-300 border border-rose-400/20"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          {new Date(log.sent_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No logs found for this search/filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none backdrop-blur-xl focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/30 transition"
      />
    </div>
  );
}

function GlowButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-r ${className} px-5 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] transition`}
    >
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconWrap,
  glow,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconWrap: string;
  glow: string;
}) {
  return (
    <div
      className={`rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-xl ${glow}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{value}</h2>
        </div>
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${iconWrap} flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}