import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";

export default function PublicPortfolio() {
  const { studentId, shareToken } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [verifyResults, setVerifyResults] = useState({});

  useEffect(() => {
    client.get(`/portfolio/public/${studentId}/${shareToken}`)
      .then((res) => setData(res.data))
      .catch(() => setError("This portfolio could not be found."));
  }, [studentId, shareToken]);

  const verify = async (activityId) => {
    const res = await client.post(`/portfolio/verify/${activityId}`);
    setVerifyResults((prev) => ({ ...prev, [activityId]: res.data }));
  };

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-primary-700">{data.student.name}</h1>
        <p className="text-sm text-gray-500">{data.student.program} · {data.student.enrollmentNo}</p>
        <p className="text-sm text-gray-600 mt-2">
          Activity score: <span className="font-medium">{data.activityScore}</span> ·
          {" "}{data.activities.length} verified activities
        </p>

        <div className="mt-6 space-y-4">
          {data.activities.map((a) => {
            const result = verifyResults[a.id];
            return (
              <div key={a.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full">verified</span>
                </div>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{a.category} · {a.pointsAwarded} pts</p>
                <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                <p className="text-xs text-gray-400 mt-2 break-all">Hash: {a.verificationHash?.slice(0, 32)}...</p>
                <button onClick={() => verify(a.id)} className="mt-2 text-xs text-primary-600 underline">
                  Re-verify this record
                </button>
                {result && (
                  <p className={`mt-1 text-xs ${result.valid ? "text-green-600" : "text-red-600"}`}>
                    {result.valid ? "Hash matches — this record is untampered." : "Hash mismatch — this record may have been altered."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
