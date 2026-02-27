"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchLogs = async () => {
    const res = await fetch("/api/logs");
    const data = await res.json();
    setLogs(data.logs || []);
    setStats(data.stats || stats);
  };

  useEffect(() => {
    if (status === "authenticated") fetchLogs();
  }, [status]);

  const buildMessage = () =>
    customMessage ||
    `🎉 Happy Birthday ${name}! Wishing you happiness and success!`;

  const handleSendEmail = async () => {
    if (!email || !name) return alert("Enter name and email");

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        type: "birthday",
        customMessage: buildMessage(),
        name,
      }),
    });

    const data = await res.json();
    alert(data.message);
    fetchLogs();
  };

  const handleSendWhatsApp = async () => {
    if (!phone || !name) return alert("Enter name and phone");

    const res = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        message: buildMessage(),
      }),
    });

    const data = await res.json();
    alert(data.message);
    fetchLogs();
  };

  const handleSendBoth = async () => {
    await handleSendEmail();
    await handleSendWhatsApp();
    setEmail("");
    setPhone("");
    setName("");
    setCustomMessage("");
  };

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800">
          📊 Notification Dashboard
        </h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* SEND SECTION */}
      <div className="bg-white p-8 rounded-2xl shadow-xl mb-12">
        <h2 className="text-2xl font-semibold mb-6">✉️ Send Notifications</h2>

        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Recipient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-xl border"
          />
          <input
            type="email"
            placeholder="Recipient Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl border"
          />
          <input
            type="text"
            placeholder="Recipient Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-3 rounded-xl border col-span-2"
          />
        </div>

        <textarea
          rows={4}
          placeholder="Custom message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full mt-6 p-3 rounded-xl border"
        />

        <div className="flex gap-6 mt-6">
          <button onClick={handleSendEmail} className="bg-blue-500 text-white px-6 py-3 rounded-xl">
            📧 Send Email
          </button>
          <button onClick={handleSendWhatsApp} className="bg-green-500 text-white px-6 py-3 rounded-xl">
            📱 Send WhatsApp
          </button>
          <button onClick={handleSendBoth} className="bg-purple-600 text-white px-6 py-3 rounded-xl">
            🚀 Send Both
          </button>
        </div>
      </div>

      {/* BULK UPLOAD */}
      <div className="bg-white p-8 rounded-2xl shadow-xl mb-12 relative">
        <h2 className="text-2xl font-semibold mb-6">📂 Bulk Upload</h2>

        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-indigo-400 rounded-2xl cursor-pointer bg-indigo-50">

          {!selectedFile && (
            <>
              <p className="text-indigo-600 font-semibold">
                Click to upload Excel file
              </p>
              <p className="text-sm text-gray-500">Only .xlsx supported</p>
            </>
          )}

          {selectedFile && (
            <div className="text-center">
              <p className="font-semibold text-indigo-700">
                📄 {selectedFile}
              </p>

              {uploading && (
                <div className="w-64 bg-gray-200 rounded-full h-3 mt-4">
                  <div
                    className="bg-indigo-500 h-3 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {uploadSuccess && (
                <p className="text-green-600 mt-3">✅ Upload Successful</p>
              )}
            </div>
          )}

          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setSelectedFile(file.name);
              setUploading(true);

              const formData = new FormData();
              formData.append("file", file);

              const res = await fetch("/api/bulk-send", {
                method: "POST",
                body: formData,
              });

              const data = await res.json();

              setUploading(false);
              setUploadSuccess(true);
              setToast(data.message);
              fetchLogs();

              setTimeout(() => {
                setUploadSuccess(false);
                setSelectedFile(null);
              }, 3000);
            }}
          />
        </label>

        {toast && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            {toast}
            <button className="ml-3" onClick={() => setToast(null)}>✕</button>
          </div>
        )}
      </div>

      {/* LOG TABLE */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{log.id}</td>
                <td className="px-6 py-4">{log.email || log.phone}</td>
                <td className="px-6 py-4">{log.channel}</td>
                <td className="px-6 py-4">{log.message}</td>
                <td className="px-6 py-4">{log.status}</td>
                <td className="px-6 py-4">
                  {new Date(log.sent_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}