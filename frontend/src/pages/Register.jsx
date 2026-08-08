import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student",
    department: "", enrollmentNo: "", program: "", year: 1,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "student" ? "/student" : user.role === "faculty" ? "/faculty" : "/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-primary-700 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join Smart Student Hub</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input required type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
          <input placeholder="Department" value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />

          {form.role === "student" && (
            <>
              <input placeholder="Enrollment no." value={form.enrollmentNo}
                onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Program (e.g. B.Tech CSE)" value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="number" min="1" max="5" placeholder="Year" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-500">
            Create account
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
