import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-primary-700">
          One verified record for every student achievement
        </h1>
        <p className="mt-4 text-gray-600">
          Smart Student Hub replaces scattered certificates and spreadsheets with a single,
          tamper-evident digital record of every student's academic and co-curricular activity —
          built for SIH25093.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-500">
            Get started
          </Link>
          <Link to="/login" className="border border-primary-600 text-primary-700 px-5 py-2.5 rounded-lg hover:bg-primary-50">
            Login
          </Link>
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-teal-600 font-medium mb-2">The problem</div>
          <p className="text-sm text-gray-600">
            Achievements are scattered across departments, paper certificates and spreadsheets,
            with no unified or verifiable record.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-teal-600 font-medium mb-2">The solution</div>
          <p className="text-sm text-gray-600">
            Students log activities, faculty verify them with a tamper-proof hash, and a
            portfolio is auto-generated with a public, verifiable link and QR code.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-teal-600 font-medium mb-2">How it works</div>
          <p className="text-sm text-gray-600">
            Submit → verify → auto-generate portfolio → institution-wide analytics for
            NAAC/NIRF-style reporting.
          </p>
        </div>
      </div>
    </div>
  );
}
