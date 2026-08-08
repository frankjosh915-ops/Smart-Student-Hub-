const express = require("express");
const { PrismaClient } = require("@prisma/client");
const QRCode = require("qrcode");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { requireAuth } = require("../middleware/auth");
const { computeActivityHash } = require("../utils/hash");

const prisma = new PrismaClient();
const router = express.Router();

async function buildPortfolioPdf(student, activities) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  page.drawText("Smart Student Hub — Verified Activity Portfolio", {
    x: 40, y, size: 16, font: bold, color: rgb(0.1, 0.2, 0.45),
  });
  y -= 30;
  page.drawText(`${student.name}  |  ${student.studentProfile?.program || ""}  |  Enrollment: ${student.studentProfile?.enrollmentNo || "-"}`, {
    x: 40, y, size: 11, font,
  });
  y -= 15;
  const score = activities.reduce((sum, a) => sum + a.pointsAwarded, 0);
  page.drawText(`Activity score: ${score}   |   Verified activities: ${activities.length}`, {
    x: 40, y, size: 11, font,
  });
  y -= 30;

  for (const a of activities) {
    if (y < 80) {
      y = 800;
      pdfDoc.addPage([595, 842]);
    }
    page.drawText(`${a.title} (${a.category})`, { x: 40, y, size: 12, font: bold });
    y -= 15;
    page.drawText(`${a.description}`.slice(0, 100), { x: 40, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 13;
    page.drawText(`Points: ${a.pointsAwarded}   Hash: ${a.verificationHash?.slice(0, 24)}...`, {
      x: 40, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 22;
  }

  return pdfDoc.save();
}

// GET /api/portfolio/:studentId/generate - authenticated student generates their own portfolio
router.get("/:studentId/generate", requireAuth, async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ error: "You can only generate your own portfolio" });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });
    if (!student || !student.studentProfile) {
      return res.status(404).json({ error: "Student not found" });
    }

    const activities = await prisma.activity.findMany({
      where: { studentId, status: "approved" },
      orderBy: { reviewedAt: "desc" },
    });

    const publicUrl = `/portfolio/${studentId}/${student.studentProfile.shareToken}`;
    const qrDataUrl = await QRCode.toDataURL(publicUrl);
    const pdfBytes = await buildPortfolioPdf(student, activities);
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    res.json({
      publicUrl,
      qrDataUrl,
      pdfBase64,
      activityScore: activities.reduce((sum, a) => sum + a.pointsAwarded, 0),
      activityCount: activities.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate portfolio" });
  }
});

// GET /api/portfolio/public/:studentId/:shareToken - no auth required
router.get("/public/:studentId/:shareToken", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!student || !student.studentProfile || student.studentProfile.shareToken !== req.params.shareToken) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const activities = await prisma.activity.findMany({
      where: { studentId, status: "approved" },
      orderBy: { reviewedAt: "desc" },
      select: {
        id: true, title: true, description: true, category: true,
        pointsAwarded: true, reviewedAt: true, verificationHash: true,
      },
    });

    res.json({
      student: {
        name: student.name,
        program: student.studentProfile.program,
        enrollmentNo: student.studentProfile.enrollmentNo,
      },
      activityScore: activities.reduce((sum, a) => sum + a.pointsAwarded, 0),
      activities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load portfolio" });
  }
});

// POST /api/portfolio/verify/:activityId - recompute hash live, prove tamper-evidence
router.post("/verify/:activityId", async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({ where: { id: Number(req.params.activityId) } });
    if (!activity || activity.status !== "approved") {
      return res.status(404).json({ error: "Approved activity not found" });
    }
    const recomputed = computeActivityHash(activity);
    res.json({
      valid: recomputed === activity.verificationHash,
      storedHash: activity.verificationHash,
      recomputedHash: recomputed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not verify activity" });
  }
});

module.exports = router;
