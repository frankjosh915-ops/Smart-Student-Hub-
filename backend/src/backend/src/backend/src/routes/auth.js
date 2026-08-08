const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, enrollmentNo, program, year } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password and role are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, department: department || null },
    });

    if (role === "student") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          enrollmentNo: enrollmentNo || `ENR${1000 + user.id}`,
          program: program || "B.Tech",
          year: year ? Number(year) : 1,
          shareToken: crypto.randomBytes(12).toString("hex"),
        },
      });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, name, email, role, department } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { studentProfile: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
