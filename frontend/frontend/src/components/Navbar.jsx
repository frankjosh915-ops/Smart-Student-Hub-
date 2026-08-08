import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === "student" ? "/student" : user?.role === "faculty" ? "/faculty" : "/admin";

  return (
    <nav className="bg-primary-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">
          Smart Student Hub
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to={dashboardPath} className="hover:text-primary-100">Dashboard</Link>
              <span className="text-primary-100">{user.name} · {user.role}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="bg-primary-600 hover:bg-primary-500 px-3 py-1.5 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-100">Login</Link>
              <Link to="/register" className="bg-primary-600 hover:bg-primary-500 px-3 py-1.5 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
