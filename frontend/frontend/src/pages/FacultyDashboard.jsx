import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import StatusBadge from "../components/StatusBadge.jsx";

export default function FacultyDashboard() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    client.get("/activities", { params: filter ? { status: filter } : {} }).then((res) => setActivities(res.data));
  };

  useEffect(load, [filter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary-700">Faculty review queue</h1>
      <p className="text-sm text-gray-500 mt-1">Approve or reject student-submitted activities.</p>

      <div className="mt-6 flex gap-2">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === s ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-600"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm divide-y">
        {activities.length === 0 && (
          <p className="p-6 text-sm text-gray-500 text-center">Nothing here right now.</p>
        )}
        {activities.map((a) => (
          <Link key={a.id} to={`/faculty/review/${a.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-800">{a.title}</p>
              <p className="text-xs text-gray-500">
                {a.student?.name} · <span className="capitalize">{a.category}</span> · {new Date(a.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={a.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
