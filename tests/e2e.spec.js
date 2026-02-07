import { test, expect } from "@playwright/test";

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d, days) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const buildPhone = () => {
  const suffix = String(Date.now()).slice(-8);
  return `139${suffix}`;
};

const teacherLogin = async (page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "老师" }).click();
  await page.getByPlaceholder("请输入老师账号").fill("小主");
  await page.getByPlaceholder("请输入密码").fill("yoga123");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page.getByText("老师：小主")).toBeVisible();
};

const studentLogin = async (page, phone, password) => {
  await page.goto("/");
  await page.getByRole("button", { name: "学员" }).click();
  await page.getByPlaceholder("请输入手机号").fill(phone);
  await page.getByPlaceholder("请输入密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page.getByText("课程表")).toBeVisible();
};

const fieldInput = (page, label) =>
  page.getByText(label, { exact: true }).locator("..").locator("input");
const fieldSelect = (page, label) =>
  page.getByText(label, { exact: true }).locator("..").locator("select");
const fieldCheckbox = (page, label) =>
  page
    .getByText(label, { exact: true })
    .locator("..")
    .locator('input[type="checkbox"]');

const mockTime = async (page, ms) => {
  await page.addInitScript(({ now }) => {
    const RealDate = Date;
    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) return new RealDate(now);
        return new RealDate(...args);
      }
      static now() {
        return now;
      }
    }
    // eslint-disable-next-line no-global-assign
    Date = MockDate;
  }, { now: ms });
};

test.describe.serial("Yoga booking mainline + edges", () => {
  const studentName = `自动化学员${String(Date.now()).slice(-4)}`;
  const studentPhone = buildPhone();
  const studentPassword = "123456";
  const studentName2 = `自动化学员${String(Date.now()).slice(-3)}B`;
  const studentPhone2 = buildPhone();
  const baseCourseTitle = `自动化基础课${String(Date.now()).slice(-4)}`;
  const advCourseTitle = `自动化进阶课${String(Date.now()).slice(-4)}`;
  const fullCourseTitle = `自动化满员课${String(Date.now()).slice(-4)}`;
  const today = new Date();
  const tomorrow = formatDate(addDays(today, 1));
  const yesterday = formatDate(addDays(today, -1));

  test("Teacher: create student card + create courses + block past/conflict", async ({
    page,
  }) => {
    await teacherLogin(page);

    // Create student + card
    await page.getByRole("button", { name: "会员卡" }).click();
    await page.getByRole("button", { name: "开卡" }).first().click();
    await fieldCheckbox(page, "新学员").check();
    await page.getByPlaceholder("请输入学员姓名").fill(studentName);
    await page.getByPlaceholder("请输入手机号").fill(studentPhone);
    await page.getByRole("button", { name: "开卡" }).last().click();
    await expect(page.getByText(studentName)).toBeVisible();

    // Create second student + card
    await page.getByRole("button", { name: "开卡" }).first().click();
    await fieldCheckbox(page, "新学员").check();
    await page.getByPlaceholder("请输入学员姓名").fill(studentName2);
    await page.getByPlaceholder("请输入手机号").fill(studentPhone2);
    await page.getByRole("button", { name: "开卡" }).last().click();
    await expect(page.getByText(studentName2)).toBeVisible();

    // Create base course (future)
    await page.getByRole("button", { name: "添加课程" }).click();
    await page.getByRole("button", { name: "新建课程" }).first().click();
    await fieldInput(page, "课程名称").fill(baseCourseTitle);
    await fieldInput(page, "日期").fill(tomorrow);
    await fieldInput(page, "时间").fill("10:00");
    await fieldSelect(page, "课程级别").selectOption("基础");
    await page.getByRole("button", { name: "新建课程" }).last().click();

    // Create advanced course (future)
    await page.getByRole("button", { name: "新建课程" }).first().click();
    await fieldInput(page, "课程名称").fill(advCourseTitle);
    await fieldInput(page, "日期").fill(tomorrow);
    await fieldInput(page, "时间").fill("11:00");
    await fieldSelect(page, "课程级别").selectOption("进阶");
    await page.getByRole("button", { name: "新建课程" }).last().click();

    // Create full course (maxStudents=1)
    await page.getByRole("button", { name: "新建课程" }).first().click();
    await fieldInput(page, "课程名称").fill(fullCourseTitle);
    await fieldInput(page, "日期").fill(tomorrow);
    await fieldInput(page, "时间").fill("12:00");
    await fieldSelect(page, "课程级别").selectOption("基础");
    await fieldInput(page, "人数上限").fill("1");
    await fieldInput(page, "最低开课").fill("1");
    await page.getByRole("button", { name: "新建课程" }).last().click();

    // Block past time
    await page.getByRole("button", { name: "新建课程" }).first().click();
    await fieldInput(page, "课程名称").fill(`过去课程${String(Date.now()).slice(-3)}`);
    await fieldInput(page, "日期").fill(yesterday);
    await fieldInput(page, "时间").fill("09:00");
    await page.getByRole("button", { name: "新建课程" }).last().click();
    await expect(page.getByText("不能创建已过去的课程时间")).toBeVisible();
    await page.getByRole("button", { name: "关闭" }).click();

    // Conflict time
    await page.getByRole("button", { name: "新建课程" }).first().click();
    await fieldInput(page, "课程名称").fill(`冲突课程${String(Date.now()).slice(-3)}`);
    await fieldInput(page, "日期").fill(tomorrow);
    await fieldInput(page, "时间").fill("10:00");
    await page.getByRole("button", { name: "新建课程" }).last().click();
    await expect(page.getByText("时间冲突，无法创建课程")).toBeVisible();
    await page.getByRole("button", { name: "关闭" }).click();

    // Verify courses exist in schedule
    await page.getByRole("button", { name: "课程表" }).click();
    await expect(page.getByText(baseCourseTitle)).toBeVisible();
    await expect(page.getByText(advCourseTitle)).toBeVisible();
    await expect(page.getByText(fullCourseTitle)).toBeVisible();
  });

  test("Student: login, see level label, book/cancel, level mismatch", async ({
    page,
  }) => {
    await studentLogin(page, studentPhone, studentPassword);

    // level label visible
    await expect(page.getByText("级别：")).toBeVisible();

    // book base course
    const baseCard = page.locator("div", { hasText: baseCourseTitle }).first();
    await baseCard.getByRole("button", { name: "预约" }).click();
    await expect(page.getByText("预约成功")).toBeVisible();

    // cancel booking
    await page.getByRole("button", { name: "我的预约" }).click();
    const bookingRow = page.locator("div", { hasText: baseCourseTitle }).first();
    await bookingRow.getByRole("button", { name: "取消预约" }).click();
    await expect(page.getByText("预约已取消")).toBeVisible();

    // level mismatch on advanced course
    await page.getByRole("button", { name: "课程表" }).click();
    const advCard = page.locator("div", { hasText: advCourseTitle }).first();
    await advCard.getByRole("button", { name: "预约" }).click();
    await expect(page.getByText("当前会员卡无法预约此课程")).toBeVisible();

    // my cards label check
    await page.getByRole("button", { name: "我的卡" }).click();
    await expect(page.getByText("可约课程")).toBeVisible();
  });

  test("Student: full course blocked for second student", async ({ page }) => {
    await studentLogin(page, studentPhone, studentPassword);
    const fullCard = page.locator("div", { hasText: fullCourseTitle }).first();
    await fullCard.getByRole("button", { name: "预约" }).click();
    await expect(page.getByText("预约成功")).toBeVisible();

    await page.getByRole("button", { name: "退出" }).click();
    await studentLogin(page, studentPhone2, studentPassword);
    const fullCard2 = page.locator("div", { hasText: fullCourseTitle }).first();
    await fullCard2.getByRole("button", { name: "预约" }).click();
    await expect(page.getByText("课程已满")).toBeVisible();
  });

  test("Student: duplicate application blocked with friendly message", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "学员" }).click();
    await page.getByRole("button", { name: "没有账号？提交申请" }).click();
    await page.getByPlaceholder("请输入姓名").fill(`申请${studentName}`);
    await page.getByPlaceholder("请输入手机号").fill(studentPhone);
    await page.getByPlaceholder("设置登录密码").fill("123456");
    await page.getByRole("button", { name: "提交申请" }).click();
    await expect(
      page.getByText("该手机号已开卡或已提交申请，请联系老师开卡")
    ).toBeVisible();
  });

  test("Course marked past (style change) after time travel", async ({ page }) => {
    const futureTime = addDays(today, 3).getTime();
    await mockTime(page, futureTime);
    await teacherLogin(page);
    const pastCard = page.locator("div", { hasText: baseCourseTitle }).first();
    await expect(pastCard).toHaveCSS("opacity", "0.6");
  });
});
