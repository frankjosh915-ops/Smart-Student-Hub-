const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireRole } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/summary", requireAuth, requireRole("admin"), async (req, res) => {
  const activities = await prisma.activity.findMany({
    include: { student: { select: { department: true } } },
  });

  const byCategory = {};
  const byStatus = { pending: 0, approved: 0, rejected: 0 };
  const byDepartment = {};

  for (const a of activities) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    const dept = a.student?.department || "Unassigned";
    byDepartment[dept] = (byDepartment[dept] || 0) + 1;
  }

  const totalStudents = await prisma.user.count({ where: { role: "student" } });

  res.json({
    totalActivities: activities.length,
    totalStudents,
    approvalRate: activities.length ? Math.round((byStatus.approved / activities.length) * 100) : 0,
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byDepartment: Object.entries(byDepartment).map(([department, count]) => ({ department, count })),
  });
});

// GET /api/analytics/export - NAAC/NIRF-style report as JSON (easy to pipe into CSV)
router.get("/export", requireAuth, requireRole("admin"), async (req, res) => {
  const activities = await prisma.activity.findMany({
    where: { status: "approved" },
    include: { student: { select: { name: true, department: true } } },
  });

  const rows = activities.map((a) => ({
    student: a.student.name,
    department: a.student.department || "Unassigned",
    category: a.category,
    title: a.title,
    points: a.pointsAwarded,
    approvedOn: a.reviewedAt,
  }));

  res.setHeader("Content-Disposition", "attachment; filename=naac-nirf-activity-report.json");
  res.json(rows);
});

module.exports = router;
