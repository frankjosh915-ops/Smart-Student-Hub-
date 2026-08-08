const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { computeActivityHash } = require("../utils/hash");

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/activities - role-aware listing
router.get("/", requireAuth, async (req, res) => {
  const { role, id } = req.user;
  const { status, category } = req.query;

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;

  if (role === "student") {
    where.studentId = id;
  } else if (role === "faculty") {
    // Faculty see everyone's submissions for review purposes (prototype scope:
    // a real deployment would scope this to the faculty's department).
  }
  // admin sees everything by default

  const activities = await prisma.activity.findMany({
    where,
    include: { student: { select: { id: true, name: true, email: true, department: true } } },
    orderBy: { submittedAt: "desc" },
  });
  res.json(activities);
});

router.get("/:id", requireAuth, async (req, res) => {
  const activity = await prisma.activity.findUnique({
    where: { id: Number(req.params.id) },
    include: { student: true, reviewer: true },
  });
  if (!activity) return res.status(404).json({ error: "Activity not found" });
  res.json(activity);
});

// POST /api/activities - student submits a new activity
router.post("/", requireAuth, requireRole("student"), upload.single("proof"), async (req, res) => {
  try {
    const { category, title, description } = req.body;
    if (!category || !title || !description) {
      return res.status(400).json({ error: "category, title and description are required" });
    }

    const activity = await prisma.activity.create({
      data: {
        studentId: req.user.id,
        category,
        title,
        description,
        proofFileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    // Notify all faculty of a new pending submission (prototype: broadcast to all faculty)
    const facultyUsers = await prisma.user.findMany({ where: { role: "faculty" } });
    await prisma.notification.createMany({
      data: facultyUsers.map((f) => ({
        userId: f.id,
        message: `New activity "${title}" submitted for review.`,
      })),
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not submit activity" });
  }
});

// PATCH /api/activities/:id/approve
router.patch("/:id/approve", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    const weight = await prisma.categoryWeight.findUnique({ where: { category: activity.category } });
    const points = weight ? weight.pointsPerActivity : 10;

    const verificationHash = computeActivityHash(activity);

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        status: "approved",
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        remarks: req.body.remarks || null,
        pointsAwarded: points,
        verificationHash,
      },
    });

    await prisma.notification.create({
      data: {
        userId: activity.studentId,
        message: `Your activity "${activity.title}" was approved (+${points} pts).`,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not approve activity" });
  }
});

// PATCH /api/activities/:id/reject
router.patch("/:id/reject", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    if (!req.body.remarks) return res.status(400).json({ error: "Remarks are required when rejecting" });

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        status: "rejected",
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        remarks: req.body.remarks,
      },
    });

    await prisma.notification.create({
      data: {
        userId: activity.studentId,
        message: `Your activity "${activity.title}" was rejected: ${req.body.remarks}`,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reject activity" });
  }
});

module.exports = router;
