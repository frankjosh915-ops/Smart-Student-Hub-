const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireRole } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/integrations/erp-sync
// Simulates pulling CGPA/attendance from an existing college ERP/LMS,
// proving integration feasibility without needing a real ERP connection.
router.post("/erp-sync", requireAuth, requireRole("student", "admin"), async (req, res) => {
  const studentId = req.body.studentId || req.user.id;
  const mockCgpa = Math.round((6.5 + Math.random() * 3) * 100) / 100;

  const profile = await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { cgpa: mockCgpa },
  });

  res.json({ message: "ERP sync complete (mock data)", cgpa: profile.cgpa });
});

module.exports = router;
