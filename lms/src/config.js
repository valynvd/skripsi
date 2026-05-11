const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function splitUrls(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const outputDir = path.resolve(
  process.cwd(),
  process.env.OUTPUT_DIR || "output",
);

module.exports = {
  baseUrl: process.env.LMS_BASE_URL,
  loginUrl:
    process.env.LMS_LOGIN_URL ||
    `${process.env.LMS_BASE_URL || ""}/login/index.php`,
  username: process.env.LMS_USERNAME,
  password: process.env.LMS_PASSWORD,
  categoryUrls: splitUrls(process.env.LMS_CATEGORY_URLS),
  attendanceUrls: splitUrls(process.env.LMS_ATTENDANCE_URLS),
  courseUrls: splitUrls(process.env.LMS_COURSE_URLS),
  headless: String(process.env.HEADLESS || "true").toLowerCase() !== "false",
  outputDir,
  storageStatePath: path.join(process.cwd(), ".auth", "storage-state.json"),
};
