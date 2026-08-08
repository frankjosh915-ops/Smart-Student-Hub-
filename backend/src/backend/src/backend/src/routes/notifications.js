const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  res.json(notifications);
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: Number(req.params.id) },
    data: { isRead: true },
  });
  res.json(notification);
});

module.exports = router;
