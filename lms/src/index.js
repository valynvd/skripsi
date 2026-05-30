const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");
const config = require("./config");

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function waitForPageReady(page, timeout = 7000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch (error) {
    // Some LMS pages keep background requests alive; DOM is usually enough.
  }
}

async function writeJson(filename, payload) {
  await ensureDir(config.outputDir);
  const targetFile = path.join(config.outputDir, filename);
  await fs.writeFile(targetFile, JSON.stringify(payload, null, 2), "utf8");
  return targetFile;
}

async function tryFill(page, selectors, value) {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.count()) {
      await element.fill(value);
      return selector;
    }
  }

  throw new Error(`Tidak menemukan input untuk selector: ${selectors.join(", ")}`);
}

async function clickFirstExisting(page, selectors) {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.count()) {
      await element.click();
      return selector;
    }
  }

  return null;
}

async function login(page) {
  if (!config.username || !config.password || !config.loginUrl) {
    throw new Error("Konfigurasi LMS belum lengkap di file .env");
  }

  await page.goto(config.loginUrl, { waitUntil: "domcontentloaded" });

  await tryFill(
    page,
    [
      'input[name="username"]',
      'input#username',
      'input[type="text"]',
      'input[autocomplete="username"]',
    ],
    config.username,
  );

  await tryFill(
    page,
    [
      'input[name="password"]',
      'input#password',
      'input[type="password"]',
      'input[autocomplete="current-password"]',
    ],
    config.password,
  );

  const clickedSelector = await clickFirstExisting(page, [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Log in")',
    'button:has-text("Login")',
  ]);

  if (!clickedSelector) {
    await page.locator("form").first().press("Enter");
  }

  await waitForPageReady(page);

  if (page.url().includes("/login/")) {
    throw new Error("Login belum berhasil. Cek username/password atau selector form.");
  }
}

async function getAuthenticatedContext(browser) {
  await ensureDir(path.dirname(config.storageStatePath));

  try {
    await fs.access(config.storageStatePath);
    return browser.newContext({ storageState: config.storageStatePath });
  } catch (error) {
    const freshContext = await browser.newContext();
    const loginPage = await freshContext.newPage();
    await login(loginPage);
    await freshContext.storageState({ path: config.storageStatePath });
    await loginPage.close();
    await freshContext.close();
    return browser.newContext({ storageState: config.storageStatePath });
  }
}

function cleanText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeAttendanceStatus(value) {
  const normalized = cleanText(value).toLowerCase();

  if (!normalized) {
    return "";
  }

  if (
    normalized.includes("present") ||
    normalized === "p" ||
    normalized === "attend" ||
    normalized === "attendance"
  ) {
    return "present";
  }

  if (
    normalized.includes("absent") ||
    normalized === "a" ||
    normalized.includes("not present")
  ) {
    return "absent";
  }

  if (normalized.includes("late") || normalized === "l") {
    return "late";
  }

  if (
    normalized.includes("excused") ||
    normalized.includes("permit") ||
    normalized.includes("izin") ||
    normalized === "e"
  ) {
    return "excused";
  }

  return normalized;
}

function normalizeCourseTitle(value) {
  return cleanText(value).replace(/^Course image\s+/i, "");
}

function normalizeMaterialSectionTitle(value) {
  return cleanText(value)
    .replace(/\s*Collapse all\s*/ig, " ")
    .replace(/\s*Expand all\s*/ig, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeTeacherName(value) {
  return cleanText(value)
    .replace(/^(teachers?|lecturers?|dosen)\s*:?\s*/i, "")
    .replace(/\s+(teachers?|lecturers?|dosen)\b\.?$/i, "")
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTeacherEntries(value) {
  const normalized = cleanText(value)
    .replace(/^["']+|["']+$/g, "")
    .replace(/^(teachers?|lecturers?|dosen)\s*:?\s*/i, "");

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\s+(?:teachers?|lecturers?|dosen)\s+(?=(?:\d{6,}\s+)?[A-Z])|,\s*|\s{2,}/i)
    .map((item) => normalizeTeacherName(item))
    .filter(Boolean);
}

function fallbackProgramTitleFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const categoryId = parsedUrl.searchParams.get("categoryid");
    return categoryId ? `Prodi ${categoryId}` : "Prodi";
  } catch (error) {
    return "Prodi";
  }
}


function normalizeAttendanceActivityUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    const id = parsedUrl.searchParams.get("id");

    if (!id) {
      return "";
    }

    if (path.endsWith("/mod/attendance/view.php") || path.endsWith("/mod/attendance/manage.php")) {
      parsedUrl.pathname = "/mod/attendance/manage.php";
      parsedUrl.search = "";
      parsedUrl.searchParams.set("id", id);
      parsedUrl.searchParams.set("view", "5");
      return parsedUrl.toString();
    }

    return "";
  } catch (error) {
    return "";
  }
}

async function expandAttendancePaging(page) {
  const selectLocator = page.locator("select").filter({ has: page.locator('option') });
  const selectCount = await selectLocator.count();

  for (let index = 0; index < selectCount; index += 1) {
    const select = selectLocator.nth(index);
    const options = await select.locator("option").evaluateAll((nodes) =>
      nodes.map((node) => ({
        value: node.getAttribute("value") || "",
        text: (node.textContent || "").replace(/\s+/g, " ").trim(),
      })),
    );

    const noPagingOption = options.find((option) =>
      /do not use paging/i.test(option.text),
    );

    if (!noPagingOption) {
      continue;
    }

    await select.selectOption(noPagingOption.value);

    const form = select.locator("xpath=ancestor::form[1]");
    if (await form.count()) {
      const goButton = form.locator(
        'input[type="submit"], button[type="submit"], button:has-text("Go")',
      ).first();

      if (await goButton.count()) {
        await Promise.allSettled([
          waitForPageReady(page),
          goButton.click(),
        ]);
      } else {
        await select.press("Enter");
        await waitForPageReady(page);
      }
    } else {
      await select.press("Enter");
      await waitForPageReady(page);
    }

    return true;
  }

  return false;
}

async function extractAttendanceParticipantsFromCurrentPage(page) {
  return page.evaluate(() => {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    const normalizeAttendanceStatus = (value) => {
      const normalized = cleanText(value).toLowerCase();

      if (!normalized) {
        return "";
      }

      if (
        normalized.includes("present") ||
        normalized === "p" ||
        normalized === "attend" ||
        normalized === "attendance"
      ) {
        return "present";
      }

      if (
        normalized.includes("absent") ||
        normalized === "a" ||
        normalized.includes("not present")
      ) {
        return "absent";
      }

      if (normalized.includes("late") || normalized === "l") {
        return "late";
      }

      if (
        normalized.includes("excused") ||
        normalized.includes("permit") ||
        normalized.includes("izin") ||
        normalized === "e"
      ) {
        return "excused";
      }

      return normalized;
    };

    const title =
      cleanText(document.querySelector("h1")?.textContent) ||
      document.title ||
      "";

    const table =
      document.querySelector("table.generaltable") ||
      document.querySelector("table");

    if (!table) {
      return {
        title,
        participants: [],
      };
    }

    const headerRows = Array.from(table.querySelectorAll("thead tr"));
    const headerTexts = headerRows.map((row) =>
      Array.from(row.querySelectorAll("th, td")).map((cell) => cleanText(cell.textContent)),
    );

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const participants = rows
      .map((row) => {
        const radioInputs = Array.from(row.querySelectorAll('input[type="radio"]'));
        if (!radioInputs.length) {
          return null;
        }

        const cells = Array.from(row.querySelectorAll("td"));
        const texts = cells.map((cell) => cleanText(cell.textContent));
        const identityCell = texts.find((text) => /^\d{6,}\s+/.test(text));

        if (!identityCell) {
          return null;
        }

        const nimMatch = identityCell.match(/^(\d{6,})\s+(.+)$/);
        const nim = nimMatch?.[1] || "";
        const name = nimMatch?.[2] || identityCell;

        const checkedInput =
          row.querySelector('input[type="radio"]:checked') || null;

        let rawStatus = "";
        if (checkedInput) {
          const parentCell = checkedInput.closest("td");
          const cellIndex = parentCell ? cells.indexOf(parentCell) : -1;
          const headerFromColumn = headerTexts
            .map((headerRow) => headerRow[cellIndex] || "")
            .find(Boolean);

          const linkedLabelText = checkedInput.id
            ? cleanText(document.querySelector(`label[for="${checkedInput.id}"]`)?.textContent)
            : "";

          rawStatus =
            cleanText(checkedInput.getAttribute("data-acronym")) ||
            cleanText(checkedInput.getAttribute("title")) ||
            cleanText(checkedInput.getAttribute("aria-label")) ||
            linkedLabelText ||
            headerFromColumn ||
            cleanText(checkedInput.getAttribute("value"));
        }

        return {
          name,
          nim,
          status: normalizeAttendanceStatus(rawStatus),
        };
      })
      .filter(Boolean);

    return {
      title,
      participants,
    };
  });
}

async function goToNextAttendancePage(page) {
  const currentUrl = page.url();
  const nextCandidates = [
    page.locator('a[rel="next"]').first(),
    page.locator('a:has-text("Next")').first(),
    page.locator('a:has-text("›")').first(),
    page.locator('a:has-text("►")').first(),
    page.locator('a:has-text("»")').first(),
  ];

  for (const locator of nextCandidates) {
    if (!(await locator.count())) {
      continue;
    }

    const href = await locator.getAttribute("href");
    if (!href || href === currentUrl) {
      continue;
    }

    await Promise.allSettled([
      waitForPageReady(page),
      locator.click(),
    ]);

    if (page.url() === currentUrl) {
      continue;
    }

    return true;
  }

  return false;
}

async function scrapeAttendanceSessionDetail(page, sessionUrl) {
  await page.goto(sessionUrl, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  await expandAttendancePaging(page);

  const participantMap = new Map();
  let title = "";
  const visitedUrls = new Set();
  let pageCount = 0;

  while (true) {
    const currentUrl = page.url();
    if (visitedUrls.has(currentUrl) || pageCount >= 20) {
      break;
    }

    visitedUrls.add(currentUrl);
    pageCount += 1;

    const pageData = await extractAttendanceParticipantsFromCurrentPage(page);
    title = title || pageData.title;

    for (const participant of pageData.participants) {
      if (!participant.nim) {
        continue;
      }

      participantMap.set(participant.nim, participant);
    }

    const moved = await goToNextAttendancePage(page);
    if (!moved) {
      break;
    }
  }

  return {
    title,
    participants: Array.from(participantMap.values()),
  };
}

async function scrapeAttendanceList(page, attendanceTarget) {
  const attendanceUrl =
    typeof attendanceTarget === "string" ? attendanceTarget : attendanceTarget.url;

  console.log(`Scraping attendance: ${attendanceUrl}`);
  await page.goto(attendanceUrl, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  const preferredFilters = ["All", "All past"];
  for (const filterText of preferredFilters) {
    const filterControl = page
      .locator('a, button', { hasText: new RegExp(`^${filterText}$`, "i") })
      .first();

    if (!(await filterControl.count())) {
      continue;
    }

    const currentUrl = page.url();
    await filterControl.click();

    try {
      await page.waitForURL((url) => url.toString() !== currentUrl, {
        timeout: 5000,
      });
    } catch (error) {
      // Some Moodle themes update the table without changing URL.
    }

    await waitForPageReady(page);
    break;
  }

  const pageData = await page.evaluate(() => {
    const title =
      document.querySelector("h1")?.textContent?.trim() ||
      document.title ||
      "";

    const selectedFilter =
      Array.from(document.querySelectorAll("a, button"))
        .find((element) => {
          const text = element.textContent?.replace(/\s+/g, " ").trim().toLowerCase();
          if (!["all", "all past"].includes(text)) {
            return false;
          }

          const classes = element.className || "";
          return /active|current|btn-primary|selected/i.test(classes) || !!element.getAttribute("aria-current");
        })
        ?.textContent?.replace(/\s+/g, " ").trim() || "";

    const table =
      document.querySelector("table.generaltable") ||
      document.querySelector("table");

    if (!table) {
      throw new Error("Tabel presensi tidak ditemukan.");
    }

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const sessions = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 4) {
          return null;
        }

        const texts = cells.map((cell) => cell.textContent.replace(/\s+/g, " ").trim());
        const dateLink = cells[1]?.querySelector("a") || cells[0]?.querySelector("a");
        const actionLinks = Array.from(row.querySelectorAll("a")).map((link) => ({
          text: link.textContent.replace(/\s+/g, " ").trim(),
          href: link.href,
          title: link.getAttribute("title") || "",
        }));

        return {
          date: texts[1] || texts[0] || "",
          time: texts[2] || "",
          studentType: texts[3] || "",
          description: texts[4] || "",
          detailUrl: dateLink?.href || "",
          actions: actionLinks,
          rawCells: texts,
        };
      })
      .filter(Boolean);

    return {
      title,
      selectedFilter,
      sessions,
    };
  });

  const detailPage = await page.context().newPage();
  try {
    for (const session of pageData.sessions) {
      if (!session.detailUrl) {
        continue;
      }

      console.log(`  Session detail: ${session.date} ${session.time}`);
      session.detail = await scrapeAttendanceSessionDetail(detailPage, session.detailUrl);
    }
  } finally {
    await detailPage.close();
  }

  return {
    sourceUrl: attendanceUrl,
    sourceProgram:
      typeof attendanceTarget === "string" ? "" : attendanceTarget.program || "",
    sourceCourseTitle:
      typeof attendanceTarget === "string" ? "" : attendanceTarget.courseTitle || "",
    sourceTeachers:
      typeof attendanceTarget === "string" ? [] : attendanceTarget.teachers || [],
    sourceAttendanceTitle:
      typeof attendanceTarget === "string" ? "" : attendanceTarget.attendanceTitle || "",
    scrapedAt: new Date().toISOString(),
    ...pageData,
  };
}

async function extractCoursesFromCurrentCategoryPage(page) {
  return page.evaluate(() => {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    const normalizeTeacherName = (value) =>
      cleanText(value)
        .replace(/^(teachers?|lecturers?|dosen)\s*:?\s*/i, "")
        .replace(/\s+(teachers?|lecturers?|dosen)\b\.?$/i, "")
        .trim();
    const courseMap = new Map();

    const addCourse = (url, title, teachers = []) => {
      if (!url || !/\/course\/view\.php\?id=\d+/i.test(url)) {
        return;
      }

      if (!courseMap.has(url)) {
        courseMap.set(url, {
          title: cleanText(title) || url,
          teachers: teachers.filter(Boolean),
          url,
        });
      }
    };

    const links = Array.from(document.querySelectorAll('a[href*="/course/view.php?id="]'));
    for (const link of links) {
      const container =
        link.closest(
          [
            ".coursebox",
            ".course-card",
            ".card",
            ".courses .course-item",
            "li.course",
            "[data-course-id]",
            ".category-browse-item",
          ].join(", "),
        ) || link.parentElement;

      const teachers = [];
      const seenTeachers = new Set();
      const teacherSelectors = [
        ".teachers",
        ".teacher",
        ".coursename + div",
        ".course-info-container .content",
        ".content .teachers",
        ".course-contacts",
        ".teacher-names",
        ".instructors",
      ];

      for (const selector of teacherSelectors) {
        const nodes = Array.from(container?.querySelectorAll(selector) || []);
        for (const node of nodes) {
          const text = cleanText(node.textContent);
          if (!text) {
            continue;
          }

          const possibleNames = text
            .split(/\s{2,}|,\s*/)
            .map((item) => normalizeTeacherName(item))
            .filter(Boolean);

          for (const name of possibleNames) {
            const key = name.toLowerCase();
            if (seenTeachers.has(key)) {
              continue;
            }

            seenTeachers.add(key);
            teachers.push(name);
          }
        }
      }

      if (!teachers.length && container) {
        const textBlocks = Array.from(container.querySelectorAll("div, p, span"))
          .map((node) => cleanText(node.textContent))
          .filter(Boolean);

        for (const text of textBlocks) {
          const match = text.match(/(?:teachers?|lecturers?|dosen)\s*:?\s*(.+)$/i);
          if (!match) {
            continue;
          }

          const possibleNames = match[1]
            .split(/\s{2,}|,\s*/)
            .map((item) => normalizeTeacherName(item))
            .filter(Boolean);

          for (const name of possibleNames) {
            const key = name.toLowerCase();
            if (seenTeachers.has(key)) {
              continue;
            }

            seenTeachers.add(key);
            teachers.push(name);
          }
        }
      }

      addCourse(link.href, link.textContent, teachers);
    }

    return Array.from(courseMap.values());
  });
}

async function goToNextCategoryPage(page) {
  const nextCandidates = [
    page.locator('a[rel="next"]').first(),
    page.locator('a:has-text("Next")').first(),
    page.locator('a:has-text("›")').first(),
    page.locator('a:has-text("►")').first(),
    page.locator('a:has-text("»")').first(),
  ];

  for (const locator of nextCandidates) {
    if (!(await locator.count())) {
      continue;
    }

    const href = await locator.getAttribute("href");
    if (!href) {
      continue;
    }

    await Promise.allSettled([
      page.waitForLoadState("networkidle"),
      locator.click(),
    ]);
    return true;
  }

  return false;
}

async function extractCategoryPaginationUrlsFromCurrentPage(page) {
  return page.evaluate(() => {
    const urls = new Set([window.location.href]);
    const currentUrl = new URL(window.location.href);
    const links = Array.from(
      document.querySelectorAll(
        '.paging a[href], .pagination a[href], nav a[href], a[rel="next"], a[rel="prev"]',
      ),
    );

    for (const link of links) {
      const href = link.href || "";
      if (!href) {
        continue;
      }

      try {
        const url = new URL(href, window.location.href);
        const samePath = url.pathname === window.location.pathname;
        const sameCategory =
          url.searchParams.get("categoryid") === currentUrl.searchParams.get("categoryid");
        const pageParam = url.searchParams.get("page");
        const isNumericPage = pageParam !== null && /^\d+$/.test(pageParam);

        if (samePath && sameCategory && isNumericPage) {
          urls.add(url.toString());
        }
      } catch (error) {
        // Ignore malformed URLs.
      }
    }

    return Array.from(urls);
  });
}

async function extractCategoryTitleFromCurrentPage(page, categoryUrl) {
  const pageTitle = await page.evaluate(() => {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    return (
      cleanText(document.querySelector("h1")?.textContent) ||
      cleanText(document.querySelector(".page-header-headings")?.textContent) ||
      cleanText(document.title)
    );
  });

  return pageTitle || fallbackProgramTitleFromUrl(categoryUrl);
}

async function discoverCoursesFromCategory(page, categoryUrl) {
  const discoveredCourseMap = new Map();
  const pendingCategoryUrls = [categoryUrl];
  const visitedCategoryUrls = new Set();
  let categoryTitle = "";

  while (pendingCategoryUrls.length) {
    const currentUrl = pendingCategoryUrls.shift();
    if (!currentUrl || visitedCategoryUrls.has(currentUrl)) {
      continue;
    }

    visitedCategoryUrls.add(currentUrl);
    console.log(`Discovering category page: ${currentUrl}`);
    await page.goto(currentUrl, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page);
    categoryTitle = categoryTitle || await extractCategoryTitleFromCurrentPage(page, categoryUrl);

    const currentPageCourses = await extractCoursesFromCurrentCategoryPage(page);
    for (const course of currentPageCourses) {
      if (!discoveredCourseMap.has(course.url)) {
        discoveredCourseMap.set(course.url, {
          ...course,
          program: categoryTitle || fallbackProgramTitleFromUrl(categoryUrl),
        });
      }
    }

    const paginationUrls = await extractCategoryPaginationUrlsFromCurrentPage(page);
    for (const paginationUrl of paginationUrls) {
      if (!visitedCategoryUrls.has(paginationUrl)) {
        pendingCategoryUrls.push(paginationUrl);
      }
    }
  }

  const discoveredCourses = Array.from(discoveredCourseMap.values());

  return {
    sourceUrl: categoryUrl,
    title: categoryTitle || fallbackProgramTitleFromUrl(categoryUrl),
    scrapedAt: new Date().toISOString(),
    totalCourses: discoveredCourses.length,
    courses: discoveredCourses,
  };
}

async function discoverAttendanceLinksFromCourse(page, course) {
  console.log(`Checking course: ${course.title}`);
  await page.goto(course.url, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  const courseData = await page.evaluate(() => {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    const linkMap = new Map();

    const addLink = (url, title, sectionTitle) => {
      if (!url || !/\/mod\/attendance\/(view|manage)\.php\?id=\d+/i.test(url)) {
        return;
      }

      if (!linkMap.has(url)) {
        linkMap.set(url, {
          title: cleanText(title) || "Attendance",
          url,
          sectionTitle: cleanText(sectionTitle),
        });
      }
    };

    const sectionCandidates = Array.from(
      document.querySelectorAll("li.section.main, section[data-for='section'], .course-section"),
    );

    for (const section of sectionCandidates) {
      const sectionTitle = cleanText(
        section.querySelector(
          ".sectionname, [data-for='section_title'], .course-section-header",
        )?.textContent,
      );

      const links = Array.from(section.querySelectorAll('a[href*="/mod/attendance/"]'));
      for (const link of links) {
        addLink(link.href, link.textContent, sectionTitle);
      }
    }

    const globalLinks = Array.from(document.querySelectorAll('a[href*="/mod/attendance/"]'));
    for (const link of globalLinks) {
      addLink(link.href, link.textContent, "");
    }

    const teacherSelectors = [
      '.teachers .content .usertext',
      '.teachers .content a',
      '.teacher .content .usertext',
      '.teacher .content a',
      '[data-region="teacher"] a',
      '.course-contact a',
      '.course-staff a',
      '.enrolmenticons + a',
    ];

    const teachers = [];
    const seenTeachers = new Set();

    for (const selector of teacherSelectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      for (const node of nodes) {
        const name = cleanText(node.textContent);
        if (!name || seenTeachers.has(name.toLowerCase())) {
          continue;
        }

        seenTeachers.add(name.toLowerCase());
        teachers.push(name);
      }
    }

    if (!teachers.length) {
      const labeledNodes = Array.from(document.querySelectorAll("li, div, p"))
        .map((node) => cleanText(node.textContent))
        .filter(Boolean);

      for (const text of labeledNodes) {
        const match = text.match(/(?:teacher|lecturer|dosen)\s*:?\s*(.+)$/i);
        const teacherName = cleanText(match?.[1]);
        if (!teacherName || seenTeachers.has(teacherName.toLowerCase())) {
          continue;
        }

        seenTeachers.add(teacherName.toLowerCase());
        teachers.push(teacherName);
      }
    }

    return {
      teachers,
      attendanceLinks: Array.from(linkMap.values()),
    };
  });

  return {
    ...course,
    teachers: courseData.teachers,
    attendanceLinks: courseData.attendanceLinks,
  };
}

async function collectAttendanceUrls(page) {
  if (config.attendanceUrls.length) {
    const normalizedUrls = config.attendanceUrls
      .map((url) => normalizeAttendanceActivityUrl(url) || url)
      .filter(Boolean);

    return {
      mode: "manual",
      categoryResults: [],
      courseResults: [],
      attendanceTargets: Array.from(new Set(normalizedUrls)).map((url) => ({
        program: "Manual",
        courseTitle: "",
        attendanceTitle: "",
        url,
      })),
    };
  }

  if (!config.categoryUrls.length) {
    throw new Error("Isi LMS_CATEGORY_URLS atau LMS_ATTENDANCE_URLS di file .env");
  }

  const categoryResults = [];
  const discoveredCourseMap = new Map();

  for (const categoryUrl of config.categoryUrls) {
    const categoryResult = await discoverCoursesFromCategory(page, categoryUrl);
    categoryResults.push(categoryResult);

    for (const course of categoryResult.courses) {
      if (!discoveredCourseMap.has(course.url)) {
        discoveredCourseMap.set(course.url, course);
      }
    }
  }

  const courseResults = [];
  const attendanceTargetMap = new Map();

  for (const course of discoveredCourseMap.values()) {
    const courseResult = await discoverAttendanceLinksFromCourse(page, course);
    courseResults.push(courseResult);

    for (const attendanceLink of courseResult.attendanceLinks) {
      const normalizedUrl = normalizeAttendanceActivityUrl(attendanceLink.url);
      if (normalizedUrl) {
        attendanceTargetMap.set(normalizedUrl, {
          program: course.program || "",
          courseTitle: normalizeCourseTitle(course.title),
          teachers: course.teachers?.length ? course.teachers : (courseResult.teachers || []),
          attendanceTitle: cleanText(attendanceLink.title),
          url: normalizedUrl,
        });
      }
    }
  }

  return {
    mode: "category",
    categoryResults,
    courseResults,
    attendanceTargets: Array.from(attendanceTargetMap.values()),
  };
}

function simplifyAttendanceResults(attendanceResults) {
  return attendanceResults.map((result) => ({
    program: result.sourceProgram || "",
    title:
      normalizeCourseTitle(result.sourceCourseTitle) ||
      normalizeCourseTitle(result.title) ||
      cleanText(result.sourceAttendanceTitle),
    teachers: (result.sourceTeachers || [])
      .flatMap((teacher) => splitTeacherEntries(teacher))
      .filter((teacher, index, array) => array.indexOf(teacher) === index),
    attendance: result.sessions.map((session) => ({
      date: session.date,
      time: session.time,
      description: session.description,
      absensi: session.detail?.participants || [],
    })),
  }));
}

async function scrapeCourseMaterials(page, courseTarget) {
  const courseUrl = typeof courseTarget === "string" ? courseTarget : courseTarget.url;
  const courseMeta =
    typeof courseTarget === "string"
      ? { program: "", title: "" }
      : {
          program: courseTarget.program || "",
          title: courseTarget.title || "",
        };

  await page.goto(courseUrl, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  return page.evaluate(({ sourceUrl, courseMeta }) => {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    const normalizeMaterialSectionTitle = (value) =>
      cleanText(value)
        .replace(/\s*Collapse all\s*/ig, " ")
        .replace(/\s*Expand all\s*/ig, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    const title =
      cleanText(document.querySelector("h1")?.textContent) ||
      cleanText(document.title);

    const sectionNodes = Array.from(
      document.querySelectorAll(
        "li.section.main, section[data-for='section'], .course-section",
      ),
    );

    const sections = sectionNodes.map((section, index) => {
      const sectionTitle =
        normalizeMaterialSectionTitle(
          section.querySelector(
            ".sectionname, [data-for='section_title'], .course-section-header",
          )?.textContent,
        ) || `Section ${index + 1}`;

      const activityNodes = Array.from(
        section.querySelectorAll(
          "li.activity, .activity-item, [data-for='activity-instance']",
        ),
      );

      const items = activityNodes.map((activity) => {
        const link = activity.querySelector("a[href]");
        const itemTitle =
          cleanText(
            activity.querySelector(".instancename, .activityname, .aalink span")?.textContent,
          ) || cleanText(link?.textContent);
        const description = cleanText(
          activity.querySelector(".contentafterlink, .description, .activity-description")
            ?.textContent,
        );
        const type =
          activity.getAttribute("data-activityname") ||
          activity.className
            .split(/\s+/)
            .find((className) => className.startsWith("modtype_")) ||
          "";

        return {
          title: itemTitle,
          description,
          type,
          url: link?.href || "",
        };
      });

      return {
        title: sectionTitle,
        items,
      };
    });

    return {
      sourceUrl,
      sourceProgram: courseMeta.program || "",
      sourceCourseTitle: courseMeta.title || "",
      scrapedAt: new Date().toISOString(),
      title,
      sections: sections.filter((section) => section.items.length > 0),
    };
  }, { sourceUrl: courseUrl, courseMeta });
}

async function collectCourseTargets(page) {
  if (config.courseUrls.length) {
    return {
      mode: "manual",
      categoryResults: [],
      courseTargets: Array.from(new Set(config.courseUrls)).map((url) => ({
        program: "Manual",
        title: "",
        url,
      })),
    };
  }

  if (!config.categoryUrls.length) {
    throw new Error("Isi LMS_CATEGORY_URLS atau LMS_COURSE_URLS di file .env");
  }

  const categoryResults = [];
  const courseTargetMap = new Map();

  for (const categoryUrl of config.categoryUrls) {
    const categoryResult = await discoverCoursesFromCategory(page, categoryUrl);
    categoryResults.push(categoryResult);

    for (const course of categoryResult.courses) {
      if (!courseTargetMap.has(course.url)) {
        courseTargetMap.set(course.url, {
          program: course.program || categoryResult.title || fallbackProgramTitleFromUrl(categoryUrl),
          title: course.title,
          url: course.url,
        });
      }
    }
  }

  return {
    mode: "category",
    categoryResults,
    courseTargets: Array.from(courseTargetMap.values()),
  };
}

function simplifyCourseMaterialsResults(materialsResults) {
  return materialsResults.map((result) => ({
    program: result.sourceProgram || "",
    title: normalizeCourseTitle(result.sourceCourseTitle) || cleanText(result.title),
    sections: (result.sections || []).map((section) => ({
      title: normalizeMaterialSectionTitle(section.title),
      items: (section.items || []).map((item) => item.title).filter(Boolean),
    })),
  }));
}

async function run() {
  const target = process.argv[2] || "all";
  const browser = await chromium.launch({ headless: config.headless });
  const context = await getAuthenticatedContext(browser);
  context.setDefaultTimeout(15000);
  context.setDefaultNavigationTimeout(30000);
  const page = await context.newPage();

  try {
    if (target === "attendance" || target === "all") {
      const attendanceDiscovery = await collectAttendanceUrls(page);
      if (!attendanceDiscovery.attendanceTargets.length) {
        throw new Error("Tidak menemukan attendance URL. Cek LMS_CATEGORY_URLS atau LMS_ATTENDANCE_URLS.");
      }

      const attendanceResults = [];
      for (const attendanceTarget of attendanceDiscovery.attendanceTargets) {
        attendanceResults.push(await scrapeAttendanceList(page, attendanceTarget));
      }

      const stamp = dateStamp();
      const simplifiedAttendanceResults = simplifyAttendanceResults(attendanceResults);
      const file = await writeJson(
        `attendance-${stamp}.json`,
        simplifiedAttendanceResults,
      );

      if (attendanceDiscovery.mode === "category") {
        await writeJson(
          `attendance-discovery-${stamp}.json`,
          attendanceDiscovery,
        );
      }

      console.log(`Attendance saved to ${file}`);
    }

    if (target === "materials" || target === "all") {
      const materialsDiscovery = await collectCourseTargets(page);
      if (!materialsDiscovery.courseTargets.length) {
        throw new Error("Tidak menemukan course URL. Cek LMS_CATEGORY_URLS atau LMS_COURSE_URLS.");
      }

      const materialsResults = [];
      for (const courseTarget of materialsDiscovery.courseTargets) {
        console.log(`Scraping materials: ${courseTarget.title || courseTarget.url}`);
        materialsResults.push(await scrapeCourseMaterials(page, courseTarget));
      }

      const simplifiedMaterialsResults = simplifyCourseMaterialsResults(materialsResults);
      const file = await writeJson(
        `materials-${dateStamp()}.json`,
        simplifiedMaterialsResults,
      );
      console.log(`Materials saved to ${file}`);
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
