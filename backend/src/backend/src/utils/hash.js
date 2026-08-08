const crypto = require("crypto");
const fs = require("fs");

/**
 * Builds a SHA-256 hash from activity metadata plus the proof file bytes
 * (if present). This is what makes an approved record tamper-evident:
 * anyone can recompute this hash later and confirm it still matches.
 */
function computeActivityHash(activity) {
  const hash = crypto.createHash("sha256");
  hash.update(
    JSON.stringify({
      id: activity.id,
      studentId: activity.studentId,
      category: activity.category,
      title: activity.title,
      description: activity.description,
    })
  );

  if (activity.proofFileUrl) {
    try {
      const filePath = activity.proofFileUrl.replace(/^\/uploads\//, "uploads/");
      if (fs.existsSync(filePath)) {
        hash.update(fs.readFileSync(filePath));
      }
    } catch (err) {
      // If the file can't be read, we still hash the metadata alone.
    }
  }

  return hash.digest("hex");
}

module.exports = { computeActivityHash };
