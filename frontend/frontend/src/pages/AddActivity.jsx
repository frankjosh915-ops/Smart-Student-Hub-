import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const categories = ["academic", "certification", "internship", "sports", "cultural", "volunteering", "leadership", "research"];

export default function AddActivity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: "certification", title: "", description: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = new FormData();
      data.append("category", form.category);
      data.append("title", form.title);
      data.append("description", form.description);
      if (file) data.append("proof", file);
      await client.post("/activities", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-primary-700 mb-6">Add an activity</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm capitalize">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. AWS Cloud Practitioner" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Briefly describe the activity" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Proof / certificate (optional)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={submitting} className="w-full bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-500 disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </div>
    </div>
  );
}
