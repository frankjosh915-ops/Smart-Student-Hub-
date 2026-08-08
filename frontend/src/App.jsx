import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AddActivity from "./pages/AddActivity.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import ActivityReview from "./pages/ActivityReview.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PublicPortfolio from "./pages/PublicPortfolio.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portfolio/:studentId/:shareToken" element={<PublicPortfolio />} />

        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/add" element={<ProtectedRoute role="student"><AddActivity /></ProtectedRoute>} />

        <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/review/:id" element={<ProtectedRoute role="faculty"><ActivityReview /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
