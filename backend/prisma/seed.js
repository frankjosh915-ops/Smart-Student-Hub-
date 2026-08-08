const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { name: "Dr. Anita Sharma", email: "admin@hub.edu", passwordHash: password, role: "admin", department: "Administration" },
  });

  const faculty1 = await prisma.user.create({
    data: { name: "Prof. Rajeev Kumar", email: "faculty@hub.edu", passwordHash: password, role: "faculty", department: "Computer Science" },
  });

  const studentsData = [
    { name: "Aarav Mehta", email: "aarav@hub.edu", program: "B.Tech CSE", year: 3, dept: "Computer Science" },
    { name: "Diya Patel", email: "diya@hub.edu", program: "B.Tech ECE", year: 2, dept: "Electronics" },
    { name: "Kabir Singh", email: "kabir@hub.edu", program: "B.Sc Physics", year: 4, dept: "Physics" },
  ];

  const students = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: { name: s.name, email: s.email, passwordHash: password, role: "student", department: s.dept },
    });
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        enrollmentNo: `ENR${2000 + user.id}`,
        program: s.program,
        year: s.year,
        cgpa: 8.1,
        shareToken: crypto.randomBytes(12).toString("hex"),
      },
    });
    students.push({ user, profile });
  }

  const weights = [
    { category: "academic", pointsPerActivity: 10 },
    { category: "certification", pointsPerActivity: 15 },
    { category: "internship", pointsPerActivity: 25 },
    { category: "sports", pointsPerActivity: 15 },
    { category: "cultural", pointsPerActivity: 10 },
    { category: "volunteering", pointsPerActivity: 12 },
    { category: "leadership", pointsPerActivity: 20 },
    { category: "research", pointsPerActivity: 30 },
  ];
  for (const w of weights) {
    await prisma.categoryWeight.create({ data: w });
  }

  const sampleActivities = [
    { student: students[0], category: "certification", title: "AWS Cloud Practitioner", description: "Completed AWS certification covering core cloud concepts.", status: "approved" },
    { student: students[0], category: "internship", title: "Summer Internship at TCS", description: "Backend development internship, 8 weeks.", status: "pending" },
    { student: students[1], category: "sports", title: "Inter-college Badminton Champion", description: "Won gold at the regional inter-college tournament.", status: "approved" },
    { student: students[2], category: "research", title: "Paper on Quantum Sensors", description: "Co-authored paper accepted at a national physics conference.", status: "pending" },
  ];

  for (const a of sampleActivities) {
    const activity = await prisma.activity.create({
      data: {
        studentId: a.student.user.id,
        category: a.category,
        title: a.title,
        description: a.description,
        status: a.status,
        reviewedById: a.status === "approved" ? faculty1.id : null,
        reviewedAt: a.status === "approved" ? new Date() : null,
        pointsAwarded: a.status === "approved" ? (weights.find((w) => w.category === a.category)?.pointsPerActivity || 10) : 0,
      },
    });
    if (a.status === "approved") {
      const crypto2 = require("crypto");
      const hash = crypto2.createHash("sha256").update(JSON.stringify({
        id: activity.id, studentId: activity.studentId, category: activity.category,
        title: activity.title, description: activity.description,
      })).digest("hex");
      await prisma.activity.update({ where: { id: activity.id }, data: { verificationHash: hash } });
    }
  }

  console.log("Seed complete. Demo logins (password: password123):");
  console.log("  Admin:   admin@hub.edu");
  console.log("  Faculty: faculty@hub.edu");
  console.log("  Students: aarav@hub.edu, diya@hub.edu, kabir@hub.edu");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
