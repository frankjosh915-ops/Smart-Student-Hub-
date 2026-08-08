import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import StatusBadge from "../components/StatusBadge.jsx";

export default function ActivityReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get(`/activities/${id}`).then((res) => setActivity(res.data));
  }, [id]);

  const approve = async () => {
    setBusy(true);
    setError("");
    try {
      await client.patch(`/activities/${id}/approve`, { remarks });
      navigate("/faculty");
    } catch (err) {
      setError(err.response?.data?.error || "Could not approve");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!remarks) return setError("Remarks are required when rejecting");
    setBusy(true);
    setError("");
    try {
      await client.patch(`/activities/${id}/reject`, { remarks });
      navigate("/faculty");
    } catch (err) {
      setError(err.response?.data?.error || "Could not reject");
    } finally {
      setBusy(false);
    }
  };

  if (!activity) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary-700">{activity.title}</h1>
          <StatusBadge status={activity.status} />
        </div>
        <p className="text-sm text-gray-500 mt-1 capitalize">{activity.category} · submitted by {activity.student?.name}</p>
        <p className="text-sm text-gray-700 mt-4">{activity.description}</p>

        {activity.proofFileUrl && (
          <a href={activity.proofFileUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm text-primary-600 underline">
            View submitted proof file
          </a>
        )}

        {activity.status === "pending" ? (
          <div className="mt-6">
            <label className="text-sm text-gray-600">Remarks (required for rejection)</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Optional note for approval, required for rejection" />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={approve} disabled={busy} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
                Approve
              </button>
              <button onClick={reject} disabled={busy} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-60">
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-600 space-y-1">
            {activity.remarks && <p>Remarks: {activity.remarks}</p>}
            {activity.verificationHash && (
              <p className="break-all text-xs text-gray-400">Verification hash: {activity.verificationHash}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
