import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import client from "../api/client";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [weights, setWeights] = useState([]);

  const load = () => {
    client.get("/analytics/summary").then((res) => setSummary(res.data));
    client.get("/category-weights").then((res) => setWeights(res.data));
  };

  useEffect(load, []);

  const updateWeight = async (id, value) => {
    await client.patch(`/category-weights/${id}`, { pointsPerActivity: value });
    load();
  };

  const exportReport = async () => {
    const res = await client.get("/analytics/export");
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naac-nirf-activity-report.json";
    a.click();
  };

  if (!summary) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-primary-700">Institution analytics</h1>
        <button onClick={exportReport} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700">
          Export NAAC / NIRF report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Stat label="Total activities" value={summary.totalActivities} />
        <Stat label="Total students" value={summary.totalStudents} />
        <Stat label="Approval rate" value={`${summary.approvalRate}%`} />
        <Stat label="Categories tracked" value={summary.byCategory.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <ChartCard title="Activities by category" data={summary.byCategory} dataKey="category" />
        <ChartCard title="Activities by department" data={summary.byDepartment} dataKey="department" />
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-medium text-gray-800 mb-4">Category point weights</h2>
        <div className="space-y-3">
          {weights.map((w) => (
            <div key={w.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{w.category}</span>
              <input
                type="number" defaultValue={w.pointsPerActivity}
                onBlur={(e) => updateWeight(w.id, e.target.value)}
                className="w-20 border rounded-lg px-2 py-1 text-sm text-right"
              />
            </div>
          ))}
        </div>
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

function ChartCard({ title, data, dataKey }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-medium text-gray-800 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey={dataKey} fontSize={11} />
          <YAxis fontSize={11} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#1f3d8f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
