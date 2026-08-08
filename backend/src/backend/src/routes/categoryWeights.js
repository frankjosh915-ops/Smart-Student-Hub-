const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireRole } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const weights = await prisma.categoryWeight.findMany();
  res.json(weights);
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { pointsPerActivity } = req.body;
  const updated = await prisma.categoryWeight.update({
    where: { id: Number(req.params.id) },
    data: { pointsPerActivity: Number(pointsPerActivity) },
  });
  res.json(updated);
});

module.exports = router;
