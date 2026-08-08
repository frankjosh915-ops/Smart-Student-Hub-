import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    client.get("/activities", { params: filter ? { status: filter } : {} }).then((res) => setActivities(res.data));
  };

  useEffect(load, [filter]);

  const score = activities.filter((a) => a.status === "approved").reduce((s, a) => s + a.pointsAwarded, 0);
  const pending = activities.filter((a) => a.status === "pending").length;
  const approved = activities.filter((a) => a.status === "approved").length;

  const generatePortfolio = async () => {
    setGenerating(true);
    try {
      const res = await client.get(`/portfolio/${user.id}/generate`);
      setPortfolio(res.data);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (!portfolio) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${portfolio.pdfBase64}`;
    link.download = "smart-student-hub-portfolio.pdf";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary-700">Welcome, {user.name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Stat label="Activity score" value={score} />
        <Stat label="Total activities" value={activities.length} />
        <Stat label="Pending" value={pending} />
        <Stat label="Approved" value={approved} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === s ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={generatePortfolio} disabled={generating}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60">
            {generating ? "Generating..." : "Generate portfolio"}
          </button>
          <Link to="/student/add" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-500">
            + Add activity
          </Link>
        </div>
      </div>

      {portfolio && (
        <div className="mt-4 bg-white rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-5 items-start">
          <img src={portfolio.qrDataUrl} alt="Portfolio QR code" className="w-32 h-32 border rounded-lg" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Public portfolio link (share this):</p>
            <a href={portfolio.publicUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-sm break-all">
              {window.location.origin}{portfolio.publicUrl}
            </a>
            <p className="text-sm text-gray-600 mt-2">
              {portfolio.activityCount} verified activities · {portfolio.activityScore} points
            </p>
            <button onClick={downloadPdf} className="mt-3 border border-primary-600 text-primary-700 px-4 py-1.5 rounded-lg text-sm hover:bg-primary-50">
              Download PDF
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm divide-y">
        {activities.length === 0 && (
          <p className="p-6 text-sm text-gray-500 text-center">No activities yet — add your first one.</p>
        )}
        {activities.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-800">{a.title}</p>
              <p className="text-xs text-gray-500 capitalize">{a.category} · {new Date(a.submittedAt).toLocaleDateString()}</p>
              {a.remarks && <p className="text-xs text-gray-500 mt-1">Remarks: {a.remarks}</p>}
            </div>
            <div className="flex items-center gap-3">
              {a.status === "approved" && <span className="text-xs text-gray-500">+{a.pointsAwarded} pts</span>}
              <StatusBadge status={a.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-2xl font-semibold text-primary-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
