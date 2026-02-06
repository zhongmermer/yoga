import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
// Yoga Booking System - Single File React Component (JSX)
// No external dependencies, all inline styles
const SUPABASE_URL = "https://xmthimontmtcradzcyhf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DkLIsNxaJf7ac-R-lYlB9g_swwr69MW";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession();
  let token = data?.session?.access_token || "";
  if (!token) {
    const refresh = await supabase.auth.refreshSession();
    token = refresh.data?.session?.access_token || "";
  }
  return token;
};
const invokeEdge = async (name, payload) => {
  const token = await getAccessToken();
  if (!token) {
    return { error: "登录已过期，请退出重新登录" };
  }
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload || {}),
  });
  const text = await resp.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!resp.ok) {
    return { error: json?.error || text || `HTTP ${resp.status}` };
  }
  return { data: json };
};
const LEVELS = ["基础", "中级", "进阶"];
const LEVEL_COLORS = {
  基础: "linear-gradient(135deg, #8fbfb5, #7fb3a8)",
  中级: "linear-gradient(135deg, #7fb3c7, #6fa6bc)",
  进阶: "linear-gradient(135deg, #9aa7d6, #8f9fd0)",
  已约: "linear-gradient(135deg, #b7c7f7, #a9bcf3)",
};
const LEVEL_STARS = {
  基础: 2,
  中级: 3,
  进阶: 4,
};
const renderStars = (level) => {
  const count = LEVEL_STARS[level] || 2;
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
};
const COURSE_DURATIONS = [45, 60, 75, 90];
const DEFAULT_TEACHERS = [
  { id: "t1", name: "小主", password: "yoga123", isAdmin: true },
];
const DEFAULT_STUDENTS = [
  { id: "s1", name: "小敏", phone: "13800000001", password: "123456" },
  { id: "s2", name: "小琳", phone: "13800000002", password: "123456" },
];
const DEFAULT_CARDS = [
  {
    id: "c1",
    studentId: "s1",
    type: "period",
    name: "月卡(基础)",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    pausedAt: "",
    pausedDays: 0,
    allowedLevels: ["基础"],
  },
  {
    id: "c2",
    studentId: "s1",
    type: "private",
    name: "私教10次",
    totalCount: 10,
    usedCount: 2,
  },
  {
    id: "c3",
    studentId: "s2",
    type: "count",
    name: "50次卡(中级)",
    totalCount: 50,
    usedCount: 5,
    allowedLevels: ["中级"],
  },
];
const DEFAULT_HOLIDAYS = [
  { id: "h1", startDate: "2026-01-15", endDate: "2026-01-17" },
];
const DEFAULT_COURSES = [
  {
    id: "co1",
    title: "早晨流瑜伽",
    date: "2026-02-03",
    time: "08:00",
    duration: 60,
    teacherId: "t1",
    maxStudents: 12,
    minStudents: 4,
    level: "基础",
    description: "唤醒身体能量",
    isPrivate: false,
  },
  {
    id: "co2",
    title: "力量瑜伽",
    date: "2026-02-03",
    time: "18:30",
    duration: 60,
    teacherId: "t2",
    maxStudents: 10,
    minStudents: 4,
    level: "中级",
    description: "提升力量与稳定",
    isPrivate: false,
  },
];
const DEFAULT_BOOKINGS = [
  {
    id: "b1",
    courseId: "co1",
    studentId: "s1",
    status: "confirmed",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];
const mapTeacherFromDb = (t) => ({
  id: t.id,
  name: t.name,
  password: t.password,
  isAdmin: t.is_admin,
  userId: t.user_id || "",
});
const mapTeacherToDb = (t) => ({
  id: t.id,
  name: t.name,
  password: t.password,
  is_admin: t.isAdmin,
  user_id: t.userId || null,
});
const mapStudentFromDb = (s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone,
  password: s.password,
  userId: s.user_id || "",
});
const mapStudentToDb = (s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone,
  password: s.password,
  user_id: s.userId || null,
});
const mapCardFromDb = (c) => ({
  id: c.id,
  studentId: c.student_id,
  type: c.type,
  name: c.name,
  startDate: c.start_date || "",
  endDate: c.end_date || "",
  pausedAt: c.paused_at || "",
  pausedDays: c.paused_days || 0,
  allowedLevels: c.allowed_levels || [],
  totalCount: c.total_count || 0,
  usedCount: c.used_count || 0,
});
const mapCardToDb = (c) => ({
  id: c.id,
  student_id: c.studentId,
  type: c.type,
  name: c.name,
  start_date: c.startDate || null,
  end_date: c.endDate || null,
  paused_at: c.pausedAt || null,
  paused_days: c.pausedDays || 0,
  allowed_levels: c.allowedLevels || [],
  total_count: c.totalCount || null,
  used_count: c.usedCount || 0,
});
const mapCourseFromDb = (c) => ({
  id: c.id,
  title: c.title,
  date: c.date,
  time: c.time,
  duration: c.duration,
  teacherId: c.teacher_id,
  maxStudents: c.max_students,
  minStudents: c.min_students,
  level: c.level,
  description: c.description,
  isPrivate: c.is_private,
  privateStudentId: c.private_student_id || "",
});
const mapCourseToDb = (c) => ({
  id: c.id,
  title: c.title,
  date: c.date,
  time: c.time,
  duration: c.duration,
  teacher_id: c.teacherId || null,
  max_students: c.maxStudents || null,
  min_students: c.minStudents || null,
  level: c.level,
  description: c.description,
  is_private: c.isPrivate,
  private_student_id: c.privateStudentId || null,
});
const mapBookingFromDb = (b) => ({
  id: b.id,
  courseId: b.course_id,
  studentId: b.student_id,
  status: b.status,
  createdAt: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
  isPrivate: b.is_private || false,
});
const mapBookingToDb = (b) => ({
  id: b.id,
  course_id: b.courseId,
  student_id: b.studentId,
  status: b.status,
  created_at: new Date(b.createdAt || Date.now()).toISOString(),
  is_private: b.isPrivate || false,
});
const mapHolidayFromDb = (h) => ({
  id: h.id,
  startDate: h.start_date,
  endDate: h.end_date,
});
const mapHolidayToDb = (h) => ({
  id: h.id,
  start_date: h.startDate,
  end_date: h.endDate,
});
const mapRegistrationFromDb = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  password: r.password,
});
const mapRegistrationToDb = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  password: r.password,
  status: r.status || "pending",
});
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const formatDate = (d) => {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
};
const formatTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const parseDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};
const parseDateTime = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};
const addDays = (dateStr, days) => {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};
const diffDays = (startDate, endDate) => {
  const a = parseDate(startDate);
  const b = parseDate(endDate);
  const diff = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};
const isBefore = (a, b) => parseDate(a).getTime() < parseDate(b).getTime();
const isAfter = (a, b) => parseDate(a).getTime() > parseDate(b).getTime();
const overlapDays = (startDate, endDate, hStart, hEnd) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const hs = parseDate(hStart);
  const he = parseDate(hEnd);
  if (end.getTime() < hs.getTime() || start.getTime() > he.getTime()) return 0;
  const actualStart = start.getTime() > hs.getTime() ? start : hs;
  const actualEnd = end.getTime() < he.getTime() ? end : he;
  const diff = actualEnd.getTime() - actualStart.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};
const calculateHolidayDays = (startDate, endDate, holidays) => {
  let total = 0;
  holidays.forEach((h) => {
    total += overlapDays(startDate, endDate, h.startDate, h.endDate);
  });
  return total;
};
const computePeriodCardEnd = (card, holidays) => {
  if (!card.startDate || !card.endDate) return "";
  const holidayDays = calculateHolidayDays(card.startDate, card.endDate, holidays);
  const pauseDays = card.pausedDays || 0;
  const totalDays = holidayDays + pauseDays;
  return addDays(card.endDate, totalDays);
};
const getNowDateStr = () => formatDate(new Date());
const getNowTimeStr = () => formatTime(new Date());
const buildId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const buildCardName = ({ type, startDate, endDate, totalCount, allowedLevels }) => {
  const levels = (allowedLevels || []).length ? (allowedLevels || []).join("+") : "不限";
  if (type === "period") {
    if (startDate && endDate) {
      const days = diffDays(startDate, endDate) + 1;
      if (days <= 13) return `周卡(${levels})`;
      if (days <= 45) return `月卡(${levels})`;
      if (days <= 110) return `季卡(${levels})`;
      if (days <= 200) return `半年卡(${levels})`;
      return `年卡(${levels})`;
    }
    return `期限卡(${levels})`;
  }
  if (type === "count") {
    const count = totalCount || 0;
    return `${count}次卡(${levels})`;
  }
  if (type === "private") {
    const count = totalCount || 0;
    return `私教${count}次`;
  }
  return "会员卡";
};
const checkCard = ({
  course,
  studentId,
  cards,
  holidays,
}) => {
  const studentCards = cards.filter((c) => c.studentId === studentId);
  if (!studentCards.length) {
    return { ok: false, reason: "没有可用会员卡" };
  }
  const isPrivate = course.isPrivate;
  if (isPrivate) {
    const privateCard = studentCards.find(
      (c) => c.type === "private" && (c.totalCount || 0) > (c.usedCount || 0)
    );
    if (!privateCard) {
      return { ok: false, reason: "没有可用私教卡" };
    }
    return { ok: true, card: privateCard };
  }
  const usable = studentCards.filter((c) => c.type !== "private");
  if (!usable.length) {
    return { ok: false, reason: "团课需使用期限卡或次卡" };
  }
  const levelCards = usable.filter((c) =>
    (c.allowedLevels || []).includes(course.level)
  );
  if (!levelCards.length) {
    return { ok: false, reason: "当前会员卡无法预约此课程" };
  }
  const today = getNowDateStr();
  const valid = levelCards.find((c) => {
    if (c.type === "period") {
      if (c.pausedAt) return false;
      const realEnd = computePeriodCardEnd(c, holidays);
      return !isAfter(today, realEnd) && !isBefore(today, c.startDate || today);
    }
    if (c.type === "count") {
      return (c.totalCount || 0) > (c.usedCount || 0);
    }
    return false;
  });
  if (!valid) {
    return { ok: false, reason: "卡已过期或次数不足" };
  }
  return { ok: true, card: valid };
};
const calculateCourseEnd = (course) => {
  const start = parseDateTime(course.date, course.time);
  const end = new Date(start.getTime() + course.duration * 60 * 1000);
  return end;
};
const detectTimeConflict = (courses, nextCourse, ignoreId = "") => {
  const nextStart = parseDateTime(nextCourse.date, nextCourse.time);
  const nextEnd = new Date(nextStart.getTime() + nextCourse.duration * 60 * 1000);
  return courses.some((c) => {
    if (ignoreId && c.id === ignoreId) return false;
    if (c.date !== nextCourse.date) return false;
    const start = parseDateTime(c.date, c.time);
    const end = calculateCourseEnd(c);
    const overlap = nextStart < end && nextEnd > start;
    if (!overlap) return false;
    if (c.teacherId === nextCourse.teacherId) return true;
    return true;
  });
};
const getWeekStart = (dateStr) => {
  const d = parseDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
};
const buildWeekDays = (weekStartStr) => {
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    days.push(addDays(weekStartStr, i));
  }
  return days;
};
const isCourseBookedByStudent = (bookings, courseId, studentId) =>
  bookings.some(
    (b) => b.courseId === courseId && b.studentId === studentId && b.status === "confirmed"
  );
const getCourseBookings = (bookings, courseId) =>
  bookings.filter((b) => b.courseId === courseId && b.status === "confirmed");
const getCourseStudentNames = (bookings, courseId, students) => {
  const enrolled = getCourseBookings(bookings, courseId);
  return enrolled
    .map((b) => students.find((s) => s.id === b.studentId))
    .filter(Boolean)
    .map((s) => s.name);
};
const countPrivateBookingsByCourse = (bookings, courseId) =>
  bookings.filter((b) => b.courseId === courseId && b.isPrivate && b.status === "confirmed").length;
const isCoursePast = (course) => {
  const end = calculateCourseEnd(course);
  return end.getTime() < Date.now();
};
const canCancelBooking = (course) => {
  const now = new Date();
  const start = parseDateTime(course.date, course.time);
  const diff = start.getTime() - now.getTime();
  return diff >= 2 * 60 * 60 * 1000;
};
const Panel = ({ title, children }) => (
  <div style={styles.panel}>
    <div style={styles.panelHeader}>{title}</div>
    <div style={styles.panelBody}>{children}</div>
  </div>
);
const Modal = ({ title, onClose, children }) => (
  <div style={styles.modalMask}>
    <div style={styles.modalCard}>
      <div style={styles.modalHeader}>
        <div>{title}</div>
        <button style={styles.closeBtn} onClick={onClose}>
          关闭
        </button>
      </div>
      <div style={styles.modalBody}>{children}</div>
    </div>
  </div>
);
const Field = ({ label, children }) => (
  <div style={styles.fieldRow}>
    <div style={styles.fieldLabel}>{label}</div>
    <div style={styles.fieldControl}>{children}</div>
  </div>
);
const Divider = () => <div style={styles.divider} />;
const Tag = ({ text, color }) => (
  <span style={{ ...styles.tag, background: color || "#eee" }}>{text}</span>
);
const Empty = ({ text }) => <div style={styles.empty}>{text}</div>;
const App = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [cards, setCards] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [studioName, setStudioName] = useState("小主瑜伽");
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getNowDateStr());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [alert, setAlert] = useState("");
  const [scheduleMode, setScheduleMode] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const todayStr = getNowDateStr();
  const baseWeekStart = getWeekStart(todayStr);
  const currentWeekStart = addDays(baseWeekStart, weekOffset * 7);
  const weekDays = buildWeekDays(currentWeekStart);
  const currentTeacher = auth?.type === "teacher"
    ? teachers.find((t) => t.id === auth.id)
    : null;
  const currentStudent = auth?.type === "student"
    ? students.find((s) => s.id === auth.id)
    : null;
  const visibleCourses = useMemo(() => {
    if (auth?.type === "student") {
      return courses.filter((c) => !c.isPrivate);
    }
    return courses;
  }, [auth, courses]);
  const scheduleCourses = useMemo(() => {
    if (scheduleMode === "day") {
      return visibleCourses.filter((c) => c.date === selectedDate);
    }
    return visibleCourses.filter((c) => weekDays.includes(c.date));
  }, [visibleCourses, scheduleMode, weekDays, selectedDate]);
  const teacherTabs = [
    { id: "schedule", label: "课程表" },
    { id: "course", label: "添加课程" },
    { id: "cards", label: "会员卡", admin: true },
    { id: "teachers", label: "老师管理", admin: true },
    { id: "holidays", label: "放假设置", admin: true },
  ];
  const studentTabs = [
    { id: "schedule", label: "课程表" },
    { id: "bookings", label: "我的预约" },
    { id: "mycards", label: "我的卡" },
  ];
  const showAlert = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(""), 2400);
  };
  const handleDbError = (error, msg) => {
    if (error) {
      console.error(error);
      const detail = error?.message ? `：${error.message}` : "";
      showAlert(`${msg}${detail}`);
    }
  };
  useEffect(() => {
    let cancelled = false;
    const loadSettings = async () => {
      const settingsRes = await supabase.from("settings").select("*").limit(1);
      if (cancelled) return;
      if (!settingsRes.error) {
        const settingsRow = settingsRes.data?.[0];
        if (settingsRow?.studio_name) setStudioName(settingsRow.studio_name);
      }
    };
    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const loadAuthedData = async () => {
      if (!auth) {
        setTeachers([]);
        setStudents([]);
        setCourses([]);
        setCards([]);
        setHolidays([]);
        setBookings([]);
        setPendingRegistrations([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const [
        teacherRes,
        studentRes,
        courseRes,
        cardRes,
        holidayRes,
        bookingRes,
        regRes,
      ] = await Promise.all([
        supabase.from("teachers").select("*"),
        supabase.from("students").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("cards").select("*"),
        supabase.from("holidays").select("*"),
        supabase.from("bookings").select("*"),
        supabase.from("registration_requests").select("*").eq("status", "pending"),
      ]);
      if (cancelled) return;
      handleDbError(teacherRes.error, "加载老师失败");
      handleDbError(studentRes.error, "加载学员失败");
      handleDbError(courseRes.error, "加载课程失败");
      handleDbError(cardRes.error, "加载会员卡失败");
      handleDbError(holidayRes.error, "加载放假设置失败");
      handleDbError(bookingRes.error, "加载预约失败");
      handleDbError(regRes.error, "加载注册申请失败");
      setTeachers((teacherRes.data || []).map(mapTeacherFromDb));
      setStudents((studentRes.data || []).map(mapStudentFromDb));
      setCourses((courseRes.data || []).map(mapCourseFromDb));
      setCards((cardRes.data || []).map(mapCardFromDb));
      setHolidays((holidayRes.data || []).map(mapHolidayFromDb));
      setBookings((bookingRes.data || []).map(mapBookingFromDb));
      setPendingRegistrations((regRes.data || []).map(mapRegistrationFromDb));
      setLoading(false);
    };
    loadAuthedData();
    return () => {
      cancelled = true;
    };
  }, [auth]);
  useEffect(() => {
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user) {
        if (mounted) setAuth(null);
        return;
      }
      const userId = session.user.id;
      const { data: teacherRow } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (teacherRow && mounted) {
        setAuth({ type: "teacher", id: teacherRow.id });
        return;
      }
      const { data: studentRow } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (studentRow && mounted) {
        setAuth({ type: "student", id: studentRow.id });
      }
    };
    syncAuth();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      syncAuth();
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (!weekDays.includes(selectedDate)) {
      setSelectedDate(weekDays[0]);
    }
  }, [weekDays, selectedDate]);
  const handleLogin = async ({ role, account, password }) => {
    const email = account.includes("@") ? account : `${account}@studio.local`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data?.user) {
      showAlert("账号或密码错误");
      return;
    }
    const userId = data.user.id;
    if (role === "teacher") {
      const { data: teacherRow, error: tError } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (tError || !teacherRow) {
        showAlert("老师账号未绑定");
        await supabase.auth.signOut();
        return;
      }
      setAuth({ type: "teacher", id: teacherRow.id });
      setActiveTab("schedule");
      return;
    }
    const { data: studentRow, error: sError } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (sError || !studentRow) {
      showAlert("学员账号未绑定");
      await supabase.auth.signOut();
      return;
    }
    setAuth({ type: "student", id: studentRow.id });
    setActiveTab("schedule");
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth(null);
  };
  const handleChangePassword = async ({ oldPassword, newPassword }) => {
    if (auth?.type !== "student") return;
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword(
      {
        email: `${currentStudent?.phone}@studio.local`,
        password: oldPassword,
      }
    );
    if (signInErr || !signInData?.user) {
      showAlert("原密码不正确");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      handleDbError(error, "密码更新失败");
      return;
    }
    setShowPasswordModal(false);
    showAlert("密码已更新");
  };
  const handleCreateCourse = async (form) => {
    const start = parseDateTime(form.date, form.time);
    if (start.getTime() < Date.now()) {
      showAlert("不能创建已过去的课程时间");
      return;
    }
    const conflict = detectTimeConflict(courses, form);
    if (conflict) {
      showAlert("时间冲突，无法创建课程");
      return;
    }
    const newCourse = { ...form };
    const insertRes = await supabase
      .from("courses")
      .insert(mapCourseToDb(newCourse))
      .select("*")
      .single();
    if (insertRes.error) {
      handleDbError(insertRes.error, "课程创建失败");
      return;
    }
    const createdCourse = mapCourseFromDb(insertRes.data);
    setCourses((prev) => [...prev, createdCourse]);
    if (createdCourse.isPrivate) {
      const selectedStudent = form.privateStudentId;
      if (selectedStudent) {
        const privateCard = cards.find(
          (c) =>
            c.studentId === selectedStudent &&
            c.type === "private" &&
            (c.totalCount || 0) > (c.usedCount || 0)
        );
        if (privateCard) {
          const booking = {
            courseId: createdCourse.id,
            studentId: selectedStudent,
            status: "confirmed",
            createdAt: Date.now(),
            isPrivate: true,
          };
          const bookingRes = await supabase
            .from("bookings")
            .insert(mapBookingToDb(booking))
            .select("*")
            .single();
          if (!bookingRes.error) {
            setBookings((prev) => [...prev, mapBookingFromDb(bookingRes.data)]);
          }
          const cardRes = await supabase
            .from("cards")
            .update({ used_count: (privateCard.usedCount || 0) + 1 })
            .eq("id", privateCard.id)
            .select("*")
            .single();
          if (!cardRes.error) {
            setCards((prev) =>
              prev.map((c) =>
                c.id === privateCard.id ? mapCardFromDb(cardRes.data) : c
              )
            );
          }
        }
      }
    }
    setShowCourseModal(false);
    showAlert("课程已创建");
  };
  const handleUpdateCourse = async (form) => {
    const start = parseDateTime(form.date, form.time);
    if (start.getTime() < Date.now()) {
      showAlert("不能设置为已过去的课程时间");
      return;
    }
    const conflict = detectTimeConflict(courses, form, form.id);
    if (conflict) {
      showAlert("时间冲突，无法更新课程");
      return;
    }
    const updateRes = await supabase
      .from("courses")
      .update(mapCourseToDb(form))
      .eq("id", form.id)
      .select("*")
      .single();
    if (updateRes.error) {
      handleDbError(updateRes.error, "课程更新失败");
      return;
    }
    setCourses((prev) =>
      prev.map((c) => (c.id === form.id ? mapCourseFromDb(updateRes.data) : c))
    );
    setShowCourseModal(false);
    setEditingCourse(null);
    showAlert("课程已更新");
  };
  const handleDeleteCourse = async (courseId) => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      handleDbError(error, "课程删除失败");
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setBookings((prev) => prev.filter((b) => b.courseId !== courseId));
    showAlert("课程已删除");
  };
  const handleCreateBooking = async (course) => {
    if (!currentStudent) return;
    const check = checkCard({ course, studentId: currentStudent.id, cards, holidays });
    if (!check.ok) {
      showAlert(check.reason || "无法预约");
      return;
    }
    const booked = isCourseBookedByStudent(bookings, course.id, currentStudent.id);
    if (booked) {
      showAlert("已预约该课程");
      return;
    }
    if (!course.isPrivate) {
      const currentBooked = getCourseBookings(bookings, course.id).length;
      if (currentBooked >= course.maxStudents) {
        showAlert("课程已满");
        return;
      }
    }
    const booking = {
      courseId: course.id,
      studentId: currentStudent.id,
      status: "confirmed",
      createdAt: Date.now(),
      isPrivate: course.isPrivate,
    };
    const bookingRes = await supabase
      .from("bookings")
      .insert(mapBookingToDb(booking))
      .select("*")
      .single();
    if (bookingRes.error) {
      handleDbError(bookingRes.error, "预约失败");
      return;
    }
    setBookings((prev) => [...prev, mapBookingFromDb(bookingRes.data)]);
    if (check.card) {
      if (check.card.type === "count" || check.card.type === "private") {
        const cardRes = await supabase
          .from("cards")
          .update({ used_count: (check.card.usedCount || 0) + 1 })
          .eq("id", check.card.id)
          .select("*")
          .single();
        if (!cardRes.error) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === check.card.id ? mapCardFromDb(cardRes.data) : c
            )
          );
        }
      }
    }
    showAlert("预约成功");
  };
  const handleCancelBooking = async (booking) => {
    const course = courses.find((c) => c.id === booking.courseId);
    if (!course) return;
    if (!canCancelBooking(course)) {
      showAlert("距开课不足2小时，无法取消");
      return;
    }
    const bookingRes = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id)
      .select("*")
      .single();
    if (bookingRes.error) {
      handleDbError(bookingRes.error, "取消失败");
      return;
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? mapBookingFromDb(bookingRes.data) : b
      )
    );
    if (booking.isPrivate) {
      const privateCard = cards.find(
        (c) =>
          c.studentId === booking.studentId &&
          c.type === "private" &&
          (c.usedCount || 0) > 0
      );
      if (privateCard) {
        const cardRes = await supabase
          .from("cards")
          .update({ used_count: Math.max(0, (privateCard.usedCount || 0) - 1) })
          .eq("id", privateCard.id)
          .select("*")
          .single();
        if (!cardRes.error) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === privateCard.id ? mapCardFromDb(cardRes.data) : c
            )
          );
        }
      }
    }
    if (!booking.isPrivate) {
      const countCard = cards.find(
        (c) => c.studentId === booking.studentId && c.type === "count"
      );
      if (countCard) {
        const cardRes = await supabase
          .from("cards")
          .update({ used_count: Math.max(0, (countCard.usedCount || 0) - 1) })
          .eq("id", countCard.id)
          .select("*")
          .single();
        if (!cardRes.error) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === countCard.id ? mapCardFromDb(cardRes.data) : c
            )
          );
        }
      }
    }
    showAlert("预约已取消");
  };
  const handleCreateCard = async (form) => {
    const insertRes = await supabase
      .from("cards")
      .insert(mapCardToDb(form))
      .select("*")
      .single();
    if (insertRes.error) {
      handleDbError(insertRes.error, "会员卡创建失败");
      return;
    }
    setCards((prev) => [...prev, mapCardFromDb(insertRes.data)]);
    setShowCardModal(false);
    showAlert("会员卡已创建");
  };
  const handleDeleteCard = async (cardId) => {
    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) {
      handleDbError(error, "会员卡删除失败");
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showAlert("会员卡已删除");
  };
  const handleTogglePause = async (card) => {
    if (card.type !== "period") return;
    if (!card.pausedAt) {
      const today = getNowDateStr();
      const { data, error } = await supabase
        .from("cards")
        .update({ paused_at: today })
        .eq("id", card.id)
        .select("*")
        .single();
      if (error) {
        handleDbError(error, "暂停失败");
        return;
      }
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? mapCardFromDb(data) : c))
      );
      showAlert("已暂停");
    } else {
      const today = getNowDateStr();
      const days = diffDays(card.pausedAt, today);
      const { data, error } = await supabase
        .from("cards")
        .update({
          paused_at: null,
          paused_days: (card.pausedDays || 0) + days,
        })
        .eq("id", card.id)
        .select("*")
        .single();
      if (error) {
        handleDbError(error, "恢复失败");
        return;
      }
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? mapCardFromDb(data) : c))
      );
      showAlert("已恢复");
    }
  };
  const handleCreateHoliday = async (form) => {
    const insertRes = await supabase
      .from("holidays")
      .insert(mapHolidayToDb(form))
      .select("*")
      .single();
    if (insertRes.error) {
      handleDbError(insertRes.error, "放假设置创建失败");
      return;
    }
    setHolidays((prev) => [...prev, mapHolidayFromDb(insertRes.data)]);
    setShowHolidayModal(false);
    showAlert("放假设置已添加");
  };
  const handleDeleteHoliday = async (holidayId) => {
    const { error } = await supabase.from("holidays").delete().eq("id", holidayId);
    if (error) {
      handleDbError(error, "放假设置删除失败");
      return;
    }
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    showAlert("放假设置已删除");
  };
  const handleCreateTeacher = async (form) => {
    const insertRes = await supabase
      .from("teachers")
      .insert(mapTeacherToDb(form))
      .select("*")
      .single();
    if (insertRes.error) {
      handleDbError(insertRes.error, "老师添加失败");
      return;
    }
    setTeachers((prev) => [...prev, mapTeacherFromDb(insertRes.data)]);
    setShowTeacherModal(false);
    showAlert("老师已添加");
  };
  const handleDeleteTeacher = async (teacherId) => {
    await supabase.from("courses").delete().eq("teacher_id", teacherId);
    const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
    if (error) {
      handleDbError(error, "老师删除失败");
      return;
    }
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    setCourses((prev) => prev.filter((c) => c.teacherId !== teacherId));
    showAlert("老师已删除");
  };
  const handleToggleAdmin = async (teacher) => {
    const { data, error } = await supabase
      .from("teachers")
      .update({ is_admin: !teacher.isAdmin })
      .eq("id", teacher.id)
      .select("*")
      .single();
    if (error) {
      handleDbError(error, "更新失败");
      return;
    }
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacher.id ? mapTeacherFromDb(data) : t))
    );
  };
  const handleResetStudentPassword = async (studentId) => {
    const { data, error } = await supabase.functions.invoke("reset-student-password", {
      body: { studentId, newPassword: "123456" },
    });
    if (error || data?.error) {
      handleDbError(error || data?.error, "重置失败");
      return;
    }
    showAlert("学员密码已重置为123456");
  };
  const isAdmin = currentTeacher?.isAdmin;
  const navTabs = (auth?.type === "teacher" ? teacherTabs : studentTabs).filter((t) =>
    t.admin ? isAdmin : true
  );
  const tabIcons = {
    schedule: "约",
    course: "课",
    cards: "卡",
    teachers: "师",
    students: "学",
    holidays: "假",
    bookings: "约",
    mycards: "卡",
  };
  return (
    <div style={styles.page}>
      <div style={styles.appShell}>
        <div style={styles.topBar}>
          <div style={styles.brand}>{studioName}</div>
          <div style={styles.topBarRight}>
            {auth ? (
              <>
                <div style={styles.userBadge}>
                  {auth.type === "teacher" ? "老师" : "学员"}：
                  {auth.type === "teacher" ? currentTeacher?.name : currentStudent?.name}
                </div>
                {auth.type === "student" && (
                  <button
                    style={styles.linkBtn}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    改密码
                  </button>
                )}
                <button style={styles.linkBtn} onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <div style={styles.topHint}>请登录</div>
            )}
          </div>
        </div>
        {alert && <div style={styles.toast}>{alert}</div>}
        {loading && <div style={styles.loading}>数据加载中...</div>}
        {!auth && (
          <LoginPanel
            studioName={studioName}
            onLogin={handleLogin}
            onRegister={() => setShowRegisterModal(true)}
          />
        )}
        {auth && (
          <div style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : null) }}>
            {!isMobile && (
              <div style={styles.sideNav}>
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    style={{
                      ...styles.navItem,
                      ...(activeTab === tab.id ? styles.navItemActive : null),
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            {isMobile && (
              <div style={styles.mobileTopTabs}>
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    style={{
                      ...styles.mobileTopTab,
                      ...(activeTab === tab.id ? styles.mobileTopTabActive : null),
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ ...styles.content, ...(isMobile ? styles.contentMobile : null) }}>
              {activeTab === "schedule" && (
                <SchedulePanel
                  isMobile={isMobile}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  scheduleMode={scheduleMode}
                  onToggleMode={setScheduleMode}
                  onPrevWeek={() => setWeekOffset((w) => w - 1)}
                  onNextWeek={() => setWeekOffset((w) => w + 1)}
                  onResetWeek={() => setWeekOffset(0)}
                  weekDays={weekDays}
                  courses={scheduleCourses}
                  allCourses={courses}
                  teachers={teachers}
                  students={students}
                  bookings={bookings}
                  auth={auth}
                  onCreateBooking={handleCreateBooking}
                  onEditCourse={(course) => {
                    setEditingCourse(course);
                    setShowCourseModal(true);
                  }}
                  onDeleteCourse={handleDeleteCourse}
                />
              )}
              {auth.type === "teacher" && activeTab === "course" && (
                <CourseCreatePanel
                  teachers={teachers}
                  students={students}
                  cards={cards}
                  onCreate={() => {
                    setEditingCourse(null);
                    setShowCourseModal(true);
                  }}
                />
              )}
              {auth.type === "student" && activeTab === "bookings" && (
                <BookingPanel
                  bookings={bookings}
                  courses={courses}
                  teachers={teachers}
                  currentStudent={currentStudent}
                  onCancel={handleCancelBooking}
                />
              )}
              {auth.type === "student" && activeTab === "mycards" && (
                <MyCardPanel
                  cards={cards}
                  currentStudent={currentStudent}
                  holidays={holidays}
                />
              )}
              {auth.type === "teacher" && activeTab === "cards" && isAdmin && (
                <CardAdminPanel
                  students={students}
                  cards={cards}
                  holidays={holidays}
                  onCreate={() => setShowCardModal(true)}
                  onDelete={handleDeleteCard}
                  onTogglePause={handleTogglePause}
                  onResetPassword={handleResetStudentPassword}
                  pendingRegistrations={pendingRegistrations}
                  onApproveRegistration={async (reg) => {
                    const { data, error } = await invokeEdge("create-student", {
                      name: reg.name,
                      phone: reg.phone,
                      password: reg.password,
                      requestId: reg.id,
                    });
                    if (error || data?.error) {
                      showAlert(error || data?.error || "开通学员失败");
                      return;
                    }
                    if (data?.student) {
                      setStudents((prev) => [...prev, mapStudentFromDb(data.student)]);
                    }
                    setPendingRegistrations((prev) => prev.filter((p) => p.id !== reg.id));
                    showAlert("已通过注册申请，请为学员开卡");
                  }}
                  onRejectRegistration={async (reg) => {
                    await supabase
                      .from("registration_requests")
                      .update({ status: "rejected" })
                      .eq("id", reg.id);
                    setPendingRegistrations((prev) => prev.filter((p) => p.id !== reg.id));
                    showAlert("已拒绝该申请");
                  }}
                />
              )}
              {auth.type === "teacher" && activeTab === "teachers" && isAdmin && (
                <TeacherAdminPanel
                  teachers={teachers}
                  onCreate={() => setShowTeacherModal(true)}
                  onDelete={handleDeleteTeacher}
                  onToggleAdmin={handleToggleAdmin}
                />
              )}
              {auth.type === "teacher" && activeTab === "holidays" && isAdmin && (
                <HolidayAdminPanel
                  holidays={holidays}
                  onCreate={() => setShowHolidayModal(true)}
                  onDelete={handleDeleteHoliday}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {showPasswordModal && auth?.type === "student" && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handleChangePassword}
        />
      )}
      {showRegisterModal && (
        <StudentRegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSubmit={async (form) => {
            const exists = students.some((s) => s.phone === form.phone);
            const pending = pendingRegistrations.some((p) => p.phone === form.phone);
            if (exists || pending) {
              showAlert("手机号已存在，请联系老师开卡");
              return;
            }
            const insertRes = await supabase
              .from("registration_requests")
              .insert(mapRegistrationToDb(form))
              .select("*")
              .single();
            if (insertRes.error) {
              handleDbError(insertRes.error, "提交失败");
              return;
            }
            setPendingRegistrations((prev) => [
              ...prev,
              mapRegistrationFromDb(insertRes.data),
            ]);
            setShowRegisterModal(false);
            showAlert("申请已提交，请联系老师开卡");
          }}
        />
      )}
      {showCourseModal && auth?.type === "teacher" && (
        <CourseModal
          teachers={teachers}
          students={students}
          cards={cards}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
          }}
          onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
          course={editingCourse}
        />
      )}
      {showCardModal && auth?.type === "teacher" && isAdmin && (
        <CardModal
          students={students}
          onClose={() => setShowCardModal(false)}
          onSubmit={handleCreateCard}
          onCreateStudent={async (form) => {
            const { data, error } = await invokeEdge("create-student", {
              name: form.name,
              phone: form.phone,
              password: form.password,
            });
            if (error || data?.error) {
              const detail = data?.error || error || "";
              showAlert(detail ? `创建学员失败：${detail}` : "创建学员失败");
              return "";
            }
            if (data?.student) {
              setStudents((prev) => [...prev, mapStudentFromDb(data.student)]);
              return data.student.id;
            }
            showAlert("创建学员失败");
            return "";
          }}
        />
      )}
      {showHolidayModal && auth?.type === "teacher" && isAdmin && (
        <HolidayModal
          onClose={() => setShowHolidayModal(false)}
          onSubmit={handleCreateHoliday}
        />
      )}
      {showTeacherModal && auth?.type === "teacher" && isAdmin && (
        <TeacherModal
          onClose={() => setShowTeacherModal(false)}
          onSubmit={handleCreateTeacher}
        />
      )}
      {auth && isMobile && null}
    </div>
  );
};
const LoginPanel = ({ onLogin, onRegister, studioName }) => {
  const [role, setRole] = useState("student");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.loginHero}>
          <div style={styles.loginLogoCircle}>
            <svg viewBox="0 0 64 64" style={styles.loginLogoIcon} aria-hidden="true">
              <circle cx="32" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
              <path
                d="M18 30c8-6 20-6 28 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M10 44c8-8 16-8 20 0s12 8 20 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={styles.loginBrand}>{studioName}</div>
          <div style={styles.loginSub}>呼吸 · 伸展 · 觉察</div>
        </div>
        <div style={styles.loginRole}>
          <button
            style={{
              ...styles.roleBtn,
              ...(role === "student" ? styles.roleBtnActive : null),
            }}
            onClick={() => setRole("student")}
          >
            学员
          </button>
          <button
            style={{
              ...styles.roleBtn,
              ...(role === "teacher" ? styles.roleBtnActive : null),
            }}
            onClick={() => setRole("teacher")}
          >
            老师
          </button>
        </div>
        <div style={styles.loginFields}>
          <div style={styles.loginField}>
          <div style={styles.loginLabel}>{role === "student" ? "手机号" : "账号"}</div>
          <input
            style={styles.input}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={role === "student" ? "请输入手机号" : "请输入老师账号"}
          />
          </div>
          <div style={styles.loginField}>
            <div style={styles.loginLabel}>密码</div>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
        </div>
        <button
          style={styles.primaryBtn}
          onClick={() => onLogin({ role, account, password })}
        >
          登录
        </button>
        {role === "student" && (
          <button style={styles.linkBtn} onClick={onRegister}>
            没有账号？提交申请
          </button>
        )}
        <div style={styles.loginHint}>
          老师账号由管理员创建，学员注册仅做申请，需老师开卡通过。
        </div>
      </div>
    </div>
  );
};
const SchedulePanel = ({
  isMobile,
  selectedDate,
  onSelectDate,
  scheduleMode,
  onToggleMode,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  weekDays,
  courses,
  allCourses,
  teachers,
  students,
  bookings,
  auth,
  onCreateBooking,
  onEditCourse,
  onDeleteCourse,
}) => {
  const currentStudentId = auth?.type === "student" ? auth.id : "";
  const grouped = useMemo(() => {
    const map = {};
    weekDays.forEach((d) => {
      map[d] = [];
    });
    courses.forEach((c) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => (a.time > b.time ? 1 : -1));
    });
    return map;
  }, [courses, weekDays]);
  const today = getNowDateStr();
  const getDayLabel = (dateStr) => {
    const d = parseDate(dateStr);
    const day = d.getDay();
    const map = ["日", "一", "二", "三", "四", "五", "六"];
    return `周${map[day]}`;
  };
  const getMonthDay = (dateStr) => {
    const d = parseDate(dateStr);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  return (
    <Panel title="课程表">
      <div style={isMobile ? styles.scheduleControlsMobile : styles.scheduleControls}>
        <div style={isMobile ? styles.toggleGroupMobile : styles.toggleGroup}>
          <button
            style={{
              ...styles.toggleBtn,
              ...(scheduleMode === "day" ? styles.toggleActive : null),
            }}
            onClick={() => onToggleMode("day")}
          >
            日课表
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(scheduleMode === "week" ? styles.toggleActive : null),
            }}
            onClick={() => onToggleMode("week")}
          >
            周课表
          </button>
        </div>
        {scheduleMode === "week" && (
          <div style={isMobile ? styles.weekNavMobile : styles.weekNav}>
            <button style={styles.linkBtn} onClick={onPrevWeek}>
              上一周
            </button>
            <button style={styles.linkBtn} onClick={onResetWeek}>
              本周
            </button>
            <button style={styles.linkBtn} onClick={onNextWeek}>
              下一周
            </button>
          </div>
        )}
      </div>
      {scheduleMode === "day" && !isMobile && (
        <div style={styles.dayHeader}>今日：{today}</div>
      )}
      {scheduleMode === "day" && isMobile && (
        <div style={styles.dateStrip}>
          {weekDays.map((d) => (
            <button
              key={d}
              style={{
                ...styles.dateItem,
                ...(selectedDate === d ? styles.dateItemActive : null),
              }}
              onClick={() => onSelectDate(d)}
            >
              <div style={styles.dateLabelTop}>
                {d === today ? "今天" : getDayLabel(d)}
              </div>
              <div style={styles.dateLabelMid}>{getMonthDay(d)}</div>
            </button>
          ))}
        </div>
      )}
      {scheduleMode === "week" && (
        <div style={isMobile ? styles.weekScrollerMobile : styles.weekScroller}>
          {weekDays.map((d) => (
            <div key={d} style={styles.weekDayCard}>
              <div style={styles.weekDayTitle}>{d}</div>
              {(grouped[d] || []).length === 0 && <Empty text="暂无课程" />}
              {(grouped[d] || []).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  allCourses={allCourses}
                  teachers={teachers}
                  students={students}
                  bookings={bookings}
                  isStudent={auth?.type === "student"}
                  isTeacher={auth?.type === "teacher"}
                  currentStudentId={currentStudentId}
                  isMobile={isMobile}
                  onBook={() => onCreateBooking(course)}
                  onEdit={() => onEditCourse(course)}
                  onDelete={() => onDeleteCourse(course.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {scheduleMode === "day" && (
        <div style={isMobile ? styles.dayListMobile : styles.dayList}>
          {courses.length === 0 && <Empty text="今日暂无课程" />}
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              allCourses={allCourses}
              teachers={teachers}
              students={students}
              bookings={bookings}
              isStudent={auth?.type === "student"}
              isTeacher={auth?.type === "teacher"}
              currentStudentId={currentStudentId}
              isMobile={isMobile}
              onBook={() => onCreateBooking(course)}
              onEdit={() => onEditCourse(course)}
              onDelete={() => onDeleteCourse(course.id)}
            />
          ))}
        </div>
      )}
    </Panel>
  );
};
const CourseCard = ({
  course,
  teachers,
  students,
  bookings,
  isStudent,
  isTeacher,
  currentStudentId,
  isMobile,
  onBook,
  onEdit,
  onDelete,
}) => {
  const teacher = teachers.find((t) => t.id === course.teacherId);
  const booked = currentStudentId
    ? isCourseBookedByStudent(bookings, course.id, currentStudentId)
    : false;
  const enrolled = getCourseBookings(bookings, course.id).length;
  const studentNames = getCourseStudentNames(bookings, course.id, students);
  const privateBooked = countPrivateBookingsByCourse(bookings, course.id);
  const isPast = isCoursePast(course);
  const levelColor = booked ? LEVEL_COLORS.已约 : LEVEL_COLORS[course.level];
  return (
    <div
      style={{
        ...styles.courseCard,
        ...(isMobile ? styles.courseCardMobile : null),
        ...(isPast ? styles.courseCardPast : null),
      }}
    >
      <div
        style={{
          ...styles.courseHeader,
          ...(isMobile ? styles.courseHeaderMobile : null),
          background: levelColor,
          ...(isPast ? styles.courseHeaderPast : null),
        }}
      >
        <div style={styles.courseTitle}>{course.title}</div>
        <div style={styles.courseTime}>
          {course.date} {course.time} · {course.duration}分钟
        </div>
      </div>
      <div style={{ ...styles.courseBody, ...(isMobile ? styles.courseBodyMobile : null) }}>
        {isMobile ? (
          <div style={styles.courseMobileMain}>
            <div style={styles.courseMobileLeft}>
              <div style={styles.courseMobileTime}>{course.time}</div>
              <div style={styles.courseMobileTitle}>{course.title}</div>
              <div style={styles.courseMobileMeta}>老师：{teacher?.name || "未设置"}</div>
              {!course.isPrivate && (
                <div style={styles.courseMobileMeta}>级别：{course.level}</div>
              )}
              {!course.isPrivate && (
                <div style={styles.courseMobileMeta}>
                  难度 <span style={styles.starText}>{renderStars(course.level)}</span>
                </div>
              )}
              <div style={styles.courseMobileMeta}>
                预约 {enrolled}/{course.maxStudents}
              </div>
              {course.isPrivate && (
                <div style={styles.courseMobileMeta}>私教预约：{privateBooked}人</div>
              )}
            </div>
            <div style={styles.courseMobileRight}>
              {isStudent && (
                <button
                  style={{
                    ...styles.primaryBtn,
                    ...(isMobile ? styles.primaryBtnMobile : null),
                    ...(booked ? styles.btnDisabled : null),
                  }}
                  onClick={onBook}
                  disabled={booked}
                >
                  {booked ? "已预约" : "预约"}
                </button>
              )}
        {isTeacher && !isPast && (
          <div style={styles.courseActions}>
            <button style={styles.outlineBtn} onClick={onEdit}>
              编辑
            </button>
            <button style={styles.dangerBtn} onClick={onDelete}>
              删除
            </button>
          </div>
        )}
            </div>
          </div>
        ) : (
          <>
            <div style={styles.courseRow}>
              <div>老师：{teacher?.name || "未设置"}</div>
              <div>
                {course.isPrivate ? (
                  <Tag text="私教" color="#2f8f6a" />
                ) : (
                  <Tag text={`级别：${course.level}`} color="#3a8a9d" />
                )}
              </div>
            </div>
            {!course.isPrivate && isStudent && (
              <div style={styles.courseRow}>
                <div>级别：{course.level}</div>
                <div />
              </div>
            )}
            <div style={styles.courseRow}>
              <div>人数：{enrolled}/{course.maxStudents}</div>
              <div>最低开课：{course.minStudents}</div>
            </div>
            <div style={styles.courseDesc}>{course.description}</div>
            {course.isPrivate && (
              <div style={styles.courseRow}>
                <div>私教预约：{privateBooked}人</div>
                <div style={styles.smallNote}>
                  {studentNames.length ? `学员：${studentNames.join("、")}` : "暂无学员"}
                </div>
              </div>
            )}
            {!course.isPrivate && studentNames.length > 0 && (
              <div style={styles.courseRow}>
                <div style={styles.smallNote}>已预约：{studentNames.join("、")}</div>
              </div>
            )}
          </>
        )}
      </div>
      {!isMobile && (
        <div style={styles.courseFooter}>
          {isStudent && (
            <button
              style={{ ...styles.primaryBtn, ...(booked ? styles.btnDisabled : null) }}
              onClick={onBook}
              disabled={booked}
            >
              {booked ? "已预约" : "预约"}
            </button>
          )}
          {isTeacher && (
            <div style={styles.courseActions}>
              <button style={styles.outlineBtn} onClick={onEdit}>
                编辑
              </button>
              <button style={styles.dangerBtn} onClick={onDelete}>
                删除
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const CourseCreatePanel = ({ teachers, students, cards, onCreate }) => (
  <Panel title="课程管理">
    <div style={styles.helperText}>
      你可以创建团课或私教课。私教课需要选择有可用私教卡的学员。
    </div>
    <button style={styles.primaryBtn} onClick={onCreate}>
      新建课程
    </button>
    <Divider />
    <div style={styles.infoRow}>
      <div>老师数量：{teachers.length}</div>
      <div>学员数量：{students.length}</div>
      <div>私教卡数量：{cards.filter((c) => c.type === "private").length}</div>
    </div>
  </Panel>
);
const BookingPanel = ({ bookings, courses, teachers, currentStudent, onCancel }) => {
  const [filter, setFilter] = useState("all");
  const allBookings = bookings.filter((b) => b.studentId === currentStudent?.id);
  const filtered = allBookings.filter((b) => {
    const course = courses.find((c) => c.id === b.courseId);
    if (!course) return false;
    const past = isCoursePast(course);
    if (filter === "upcoming") return b.status === "confirmed" && !past;
    if (filter === "past") return past;
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });
  return (
    <Panel title="我的预约">
      <div style={styles.filterRow}>
        {[
          { id: "all", label: "全部" },
          { id: "upcoming", label: "即将开始" },
          { id: "past", label: "已结束" },
          { id: "cancelled", label: "已取消" },
        ].map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.filterBtn,
              ...(filter === item.id ? styles.filterBtnActive : null),
            }}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <Empty text="暂无预约" />}
      {filtered.map((booking) => {
        const course = courses.find((c) => c.id === booking.courseId);
        if (!course) return null;
        const teacher = teachers.find((t) => t.id === course.teacherId);
        const canCancel = canCancelBooking(course);
        const past = isCoursePast(course);
        return (
          <div
            key={booking.id}
            style={{
              ...styles.bookingCard,
              ...(past || booking.status === "cancelled" ? styles.bookingCardPast : null),
            }}
          >
            <div style={styles.bookingInfo}>
              <div style={styles.bookingTitle}>{course.title}</div>
              <div style={styles.bookingRow}>
                {course.date} {course.time} · {course.duration}分钟
              </div>
              <div style={styles.bookingRow}>老师：{teacher?.name}</div>
              {(past || booking.status === "cancelled") && (
                <div style={styles.bookingRow}>
                  {booking.status === "cancelled" ? "已取消" : "已结束"}
                </div>
              )}
            </div>
            <button
              style={{ ...styles.outlineBtn, ...(canCancel ? null : styles.btnDisabled) }}
              onClick={() => onCancel(booking)}
              disabled={!canCancel}
            >
              取消预约
            </button>
          </div>
        );
      })}
    </Panel>
  );
};
const MyCardPanel = ({ cards, currentStudent, holidays }) => {
  const myCards = cards.filter((c) => c.studentId === currentStudent?.id);
  return (
    <Panel title="我的会员卡">
      {myCards.length === 0 && <Empty text="暂无会员卡" />}
      {myCards.map((card) => {
        const status = getCardStatus(card, holidays);
        return (
        <div key={card.id} style={styles.cardItem}>
          <div style={styles.cardHeader}>
            <div style={styles.cardName}>{card.name}</div>
            <Tag text={normalizeStatusText(status.text)} color={status.color} />
          </div>
            <div style={styles.cardBody}>
              <CardDetail card={card} holidays={holidays} />
            </div>
          </div>
        );
      })}
    </Panel>
  );
};
const CardDetail = ({ card, holidays }) => {
  if (card.type === "period") {
    const realEnd = computePeriodCardEnd(card, holidays);
    return (
      <div style={styles.cardDetailList}>
        <div>类型：期限卡</div>
        <div>开始：{card.startDate}</div>
        <div>结束：{card.endDate}</div>
        <div>实际到期：{realEnd}</div>
        <div>暂停天数：{card.pausedDays || 0}</div>
        <div>可约课程：{(card.allowedLevels || []).join("、") || "不限"}</div>
      </div>
    );
  }
  if (card.type === "count") {
    return (
      <div style={styles.cardDetailList}>
        <div>类型：次卡</div>
        <div>总次数：{card.totalCount}</div>
        <div>已使用：{card.usedCount || 0}</div>
        <div>剩余：{(card.totalCount || 0) - (card.usedCount || 0)}</div>
        <div>可约课程：{(card.allowedLevels || []).join("、") || "不限"}</div>
      </div>
    );
  }
  return (
    <div style={styles.cardDetailList}>
      <div>类型：私教卡</div>
      <div>总次数：{card.totalCount}</div>
      <div>已使用：{card.usedCount || 0}</div>
      <div>剩余：{(card.totalCount || 0) - (card.usedCount || 0)}</div>
    </div>
  );
};
const CardAdminPanel = ({
  students,
  cards,
  holidays,
  onCreate,
  onDelete,
  onTogglePause,
  onResetPassword,
  pendingRegistrations,
  onApproveRegistration,
  onRejectRegistration,
}) => {
  const grouped = students
    .map((student) => ({
      student,
      items: cards.filter((c) => c.studentId === student.id),
    }))
    .filter((g) => g.items.length > 0);
  return (
    <Panel title="会员卡管理">
      <button style={styles.primaryBtn} onClick={onCreate}>
        开卡
      </button>
      <Divider />
      {pendingRegistrations?.length > 0 && (
        <div style={styles.cardGroup}>
          <div style={styles.cardGroupHeader}>
            <div style={styles.cardGroupTitle}>注册申请</div>
            <div style={styles.cardGroupSub}>待审核</div>
          </div>
          <div style={styles.cardGroupList}>
            {pendingRegistrations.map((reg) => (
              <div key={reg.id} style={styles.adminRow}>
                <div>
                  {reg.name} · {reg.phone}
                </div>
                <div style={styles.adminActions}>
                  <button
                    style={styles.outlineBtn}
                    onClick={() => onApproveRegistration && onApproveRegistration(reg)}
                  >
                    通过
                  </button>
                  <button
                    style={styles.dangerBtn}
                    onClick={() => onRejectRegistration && onRejectRegistration(reg)}
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Divider />
        </div>
      )}
      {cards.length === 0 && <Empty text="暂无会员卡" />}
      {grouped.map((group) => (
        <div key={group.student.id} style={styles.cardGroup}>
          <div style={styles.cardGroupHeader}>
            <div>
              <div style={styles.cardGroupTitle}>{group.student.name}</div>
              <div style={styles.cardGroupSub}>{group.student.phone}</div>
            </div>
            <button
              style={styles.outlineBtn}
              onClick={() => onResetPassword && onResetPassword(group.student.id)}
            >
              重置密码
            </button>
          </div>
          <div style={styles.cardGroupList}>
            {group.items.map((card) => {
              const status = getCardStatus(card, holidays);
              return (
                <div key={card.id} style={styles.cardItem}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardName}>{card.name}</div>
            <Tag text={normalizeStatusText(status.text)} color={status.color} />
          </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardDetailList}>
                      <CardDetail card={card} holidays={holidays} />
                    </div>
                    <div style={styles.cardActions}>
                      {card.type === "period" && (
                        <button style={styles.outlineBtn} onClick={() => onTogglePause(card)}>
                          {card.pausedAt ? "恢复" : "暂停"}
                        </button>
                      )}
                      <button style={styles.dangerBtn} onClick={() => onDelete(card.id)}>
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Panel>
  );
};
const TeacherAdminPanel = ({ teachers, onCreate, onDelete, onToggleAdmin }) => (
  <Panel title="老师管理">
    <button style={styles.primaryBtn} onClick={onCreate}>
      添加老师
    </button>
    <Divider />
    {teachers.map((teacher) => (
      <div key={teacher.id} style={styles.adminRow}>
        <div>
          {teacher.name} {teacher.isAdmin ? "(管理员)" : ""}
        </div>
        <div style={styles.adminActions}>
          <button style={styles.outlineBtn} onClick={() => onToggleAdmin(teacher)}>
            {teacher.isAdmin ? "取消管理员" : "设为管理员"}
          </button>
          <button style={styles.dangerBtn} onClick={() => onDelete(teacher.id)}>
            删除
          </button>
        </div>
      </div>
    ))}
  </Panel>
);
const HolidayAdminPanel = ({ holidays, onCreate, onDelete }) => (
  <Panel title="放假设置">
    <button style={styles.primaryBtn} onClick={onCreate}>
      添加放假
    </button>
    <Divider />
    {holidays.length === 0 && <Empty text="暂无放假设置" />}
    {holidays.map((holiday) => (
      <div key={holiday.id} style={styles.adminRow}>
        <div>
          {holiday.startDate} ~ {holiday.endDate}
        </div>
        <div style={styles.adminActions}>
          <button style={styles.dangerBtn} onClick={() => onDelete(holiday.id)}>
            删除
          </button>
        </div>
      </div>
    ))}
  </Panel>
);
const PasswordModal = ({ onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  return (
    <Modal title="修改密码" onClose={onClose}>
      <Field label="旧密码">
        <input
          style={styles.input}
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </Field>
      <Field label="新密码">
        <input
          style={styles.input}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Field>
      <button
        style={styles.primaryBtn}
        onClick={() => onSubmit({ oldPassword, newPassword })}
      >
        确认修改
      </button>
    </Modal>
  );
};
const StudentRegisterModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Modal title="学员申请" onClose={onClose}>
      <Field label="姓名">
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入姓名"
        />
      </Field>
      <Field label="手机号">
        <input
          style={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="请输入手机号"
        />
      </Field>
      <Field label="密码">
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="设置登录密码"
        />
      </Field>
      <button
        style={styles.primaryBtn}
        onClick={() => {
          if (!name || !phone || !password) return;
          onSubmit({ name, phone, password });
        }}
      >
        提交申请
      </button>
    </Modal>
  );
};
const CourseModal = ({ teachers, students, cards, onClose, onSubmit, course }) => {
  const isEdit = Boolean(course);
  const initialStudent = course?.privateStudentId || "";
  const [form, setForm] = useState(
    course || {
      title: "",
      date: getNowDateStr(),
      time: getNowTimeStr(),
      duration: 60,
      teacherId: teachers[0]?.id || "",
      maxStudents: 10,
      minStudents: 4,
      level: "基础",
      description: "",
      isPrivate: false,
      privateStudentId: "",
    }
  );
  const eligiblePrivateStudents = useMemo(() => {
    return students.filter((s) =>
      cards.some(
        (c) =>
          c.studentId === s.id &&
          c.type === "private" &&
          (c.totalCount || 0) > (c.usedCount || 0)
      )
    );
  }, [students, cards]);
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <Modal title={isEdit ? "编辑课程" : "新建课程"} onClose={onClose}>
      <Field label="课程名称">
        <input
          style={styles.input}
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </Field>
      <Field label="私教课">
        <input
          type="checkbox"
          checked={form.isPrivate}
          onChange={(e) => handleChange("isPrivate", e.target.checked)}
        />
      </Field>
      <Field label="日期">
        <input
          style={styles.input}
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />
      </Field>
      <Field label="时间">
        <input
          style={styles.input}
          type="time"
          value={form.time}
          onChange={(e) => handleChange("time", e.target.value)}
        />
      </Field>
      <Field label="时长">
        <select
          style={styles.select}
          value={form.duration}
          onChange={(e) => handleChange("duration", parseInt(e.target.value, 10))}
        >
          {COURSE_DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d}分钟
            </option>
          ))}
        </select>
      </Field>
      <Field label="老师">
        <select
          style={styles.select}
          value={form.teacherId}
          onChange={(e) => handleChange("teacherId", e.target.value)}
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="课程级别">
        <select
          style={{
            ...styles.select,
            ...(form.isPrivate ? styles.inputDisabled : null),
          }}
          value={form.level}
          onChange={(e) => handleChange("level", e.target.value)}
          disabled={form.isPrivate}
        >
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </Field>
      <Field label="人数上限">
        <input
          style={{
            ...styles.input,
            ...(form.isPrivate ? styles.inputDisabled : null),
          }}
          type="number"
          value={form.maxStudents}
          onChange={(e) => handleChange("maxStudents", parseInt(e.target.value, 10))}
          disabled={form.isPrivate}
        />
      </Field>
      <Field label="最低开课">
        <input
          style={{
            ...styles.input,
            ...(form.isPrivate ? styles.inputDisabled : null),
          }}
          type="number"
          value={form.minStudents}
          onChange={(e) => handleChange("minStudents", parseInt(e.target.value, 10))}
          disabled={form.isPrivate}
        />
      </Field>
      <Field label="描述">
        <textarea
          style={styles.textarea}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </Field>
      {form.isPrivate && (
        <Field label="指定学员">
          <select
            style={styles.select}
            value={form.privateStudentId || initialStudent}
            onChange={(e) => handleChange("privateStudentId", e.target.value)}
          >
            <option value="">请选择</option>
            {eligiblePrivateStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <button
        style={styles.primaryBtn}
        onClick={() => onSubmit({ ...form })}
      >
        {isEdit ? "保存" : "新建课程"}
      </button>
    </Modal>
  );
};
const CardModal = ({ students, onClose, onSubmit, onCreateStudent }) => {
  const [form, setForm] = useState({
    studentId: students[0]?.id || "",
    type: "period",
    name: "",
    startDate: getNowDateStr(),
    endDate: addDays(getNowDateStr(), 30),
    pausedAt: "",
    pausedDays: 0,
    totalCount: 10,
    usedCount: 0,
    allowedLevels: ["基础"],
  });
  const [createNew, setCreateNew] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    password: "123456",
  });
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleNewStudentChange = (key, value) => {
    setNewStudent((prev) => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    const nextName = buildCardName(form);
    setForm((prev) => ({ ...prev, name: nextName }));
  }, [form.type, form.startDate, form.endDate, form.totalCount, form.allowedLevels]);
  return (
    <Modal title="开卡" onClose={onClose}>
      <Field label="新学员">
        <input
          type="checkbox"
          checked={createNew}
          onChange={(e) => setCreateNew(e.target.checked)}
        />
      </Field>
      {!createNew && (
        <Field label="学员">
          <select
            style={styles.select}
            value={form.studentId}
            onChange={(e) => handleChange("studentId", e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {createNew && (
        <>
          <Field label="姓名">
            <input
              style={styles.input}
              value={newStudent.name}
              onChange={(e) => handleNewStudentChange("name", e.target.value)}
              placeholder="请输入学员姓名"
            />
          </Field>
          <Field label="手机号">
            <input
              style={styles.input}
              value={newStudent.phone}
              onChange={(e) => handleNewStudentChange("phone", e.target.value)}
              placeholder="请输入手机号"
            />
          </Field>
          <Field label="密码">
            <input
              style={styles.input}
              value={newStudent.password}
              onChange={(e) => handleNewStudentChange("password", e.target.value)}
            />
          </Field>
        </>
      )}
      <Field label="卡类型">
        <select
          style={styles.select}
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <option value="period">期限卡</option>
          <option value="count">次卡</option>
          <option value="private">私教卡</option>
        </select>
      </Field>
      <Field label="卡名称">
        <input
          style={{ ...styles.input, ...styles.inputDisabled }}
          value={form.name}
          onChange={() => {}}
          disabled
        />
      </Field>
      {form.type === "period" && (
        <>
          <Field label="开始日期">
            <input
              style={styles.input}
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </Field>
          <Field label="结束日期">
            <input
              style={styles.input}
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </Field>
        </>
      )}
      {(form.type === "count" || form.type === "private") && (
        <>
          <Field label="总次数">
            <input
              style={styles.input}
              type="number"
              value={form.totalCount}
              onChange={(e) => handleChange("totalCount", parseInt(e.target.value, 10))}
            />
          </Field>
        </>
      )}
      {(form.type === "period" || form.type === "count") && (
        <Field label="可用级别">
          <div style={styles.levelList}>
            {LEVELS.map((level) => (
              <label key={level} style={styles.levelItem}>
                <input
                  type="checkbox"
                  checked={form.allowedLevels.includes(level)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const next = checked
                      ? [...form.allowedLevels, level]
                      : form.allowedLevels.filter((l) => l !== level);
                    handleChange("allowedLevels", next);
                  }}
                />
                {level}
              </label>
            ))}
          </div>
        </Field>
      )}
      <button
        style={styles.primaryBtn}
        onClick={async () => {
          if (createNew) {
            if (!newStudent.name || !newStudent.phone || !newStudent.password) return;
            const newId = onCreateStudent ? await onCreateStudent({ ...newStudent }) : "";
            if (!newId) return;
            onSubmit({ ...form, studentId: newId });
            return;
          }
          onSubmit({ ...form });
        }}
      >
        开卡
      </button>
    </Modal>
  );
};
const HolidayModal = ({ onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState(getNowDateStr());
  const [endDate, setEndDate] = useState(addDays(getNowDateStr(), 1));
  return (
    <Modal title="添加放假" onClose={onClose}>
      <Field label="开始日期">
        <input
          style={styles.input}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Field>
      <Field label="结束日期">
        <input
          style={styles.input}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Field>
      <button
        style={styles.primaryBtn}
        onClick={() => onSubmit({ startDate, endDate })}
      >
        确认
      </button>
    </Modal>
  );
};
const TeacherModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("yoga123");
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <Modal title="添加老师" onClose={onClose}>
      <Field label="姓名">
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="密码">
        <input
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="管理员">
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
        />
      </Field>
      <button
        style={styles.primaryBtn}
        onClick={() => onSubmit({ name, password, isAdmin })}
      >
        确认
      </button>
    </Modal>
  );
};
const getCardStatus = (card, holidays) => {
  const today = getNowDateStr();
  if (card.type === "period") {
    if (card.pausedAt) {
      return { text: "暂停中", color: "#f0b429" };
    }
    const realEnd = computePeriodCardEnd(card, holidays);
    if (isAfter(today, realEnd)) {
      return { text: "已过期", color: "#d14a4a" };
    }
    return { text: "生效中", color: "#2f8f6a" };
  }
  if (card.type === "count" || card.type === "private") {
    if ((card.totalCount || 0) <= (card.usedCount || 0)) {
      return { text: "已用完", color: "#d14a4a" };
    }
    return { text: "生效中", color: "#2f8f6a" };
  }
  return { text: "未知", color: "#999" };
};

const normalizeStatusText = (text) => (text === "已过渡" ? "已过期" : text);
const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #f4f7ff, #f6f4fb)", padding: "16px", fontFamily: "\"Avenir Next\", \"PingFang SC\", \"Noto Sans SC\", sans-serif" },
  appShell: { maxWidth: "1120px", margin: "0 auto", background: "#f9faff", borderRadius: "26px", boxShadow: "0 22px 60px rgba(78, 90, 120, 0.12)", overflow: "hidden" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 20px", background: "linear-gradient(120deg, #edf2ff, #f2ecff)", borderBottom: "1px solid rgba(255,255,255,0.8)" },
  brand: { fontSize: "20px", fontWeight: 800, color: "#3a4766", letterSpacing: "0.5px" },
  topBarRight: { display: "flex", gap: "12px", alignItems: "center" },
  topHint: { color: "#7b85a1", fontSize: "14px" },
  loading: { padding: "10px 16px", color: "#7b85a1", fontSize: "13px" },
  userBadge: { padding: "6px 10px", background: "rgba(255,255,255,0.8)", borderRadius: "12px", color: "#4a5674", fontWeight: 700 },
  body: { display: "flex", minHeight: "80vh" },
  sideNav: { width: "200px", padding: "20px", background: "#f9faff", borderRight: "1px solid #e8edf7", display: "flex", flexDirection: "column", gap: "10px" },
  navItem: { padding: "10px 14px", borderRadius: "12px", border: "1px solid #e8edf7", background: "#fff", color: "#42506f", textAlign: "left", cursor: "pointer", fontWeight: 700 },
  navItemActive: { background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff", border: "1px solid transparent" },
  content: { flex: 1, padding: "20px" },
  bodyMobile: { flexDirection: "column" },
  contentMobile: { padding: "12px 14px 24px" },
  mobileTopTabs: { display: "flex", gap: "8px", padding: "10px 14px 0", overflowX: "auto" },
  mobileTopTab: { padding: "8px 14px", borderRadius: "16px", border: "1px solid #e8edf7", background: "#fff", color: "#42506f", fontWeight: 700, whiteSpace: "nowrap" },
  mobileTopTabActive: { background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff", border: "1px solid transparent" },
  panel: { background: "#fff", borderRadius: "20px", border: "1px solid #edf1f7", padding: "16px", boxShadow: "0 12px 28px rgba(78, 90, 120, 0.08)" },
  panelHeader: { fontSize: "18px", fontWeight: 800, color: "#3a4766", marginBottom: "12px" },
  panelBody: { display: "flex", flexDirection: "column", gap: "12px" },
  loginWrap: { padding: "40px", display: "flex", justifyContent: "center" },
  loginCard: { width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "24px", padding: "26px", border: "1px solid #edf1f7", boxShadow: "0 16px 36px rgba(78, 90, 120, 0.10)", display: "flex", flexDirection: "column", gap: "16px" },
  loginHero: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "6px 0 2px" },
  loginLogoCircle: { width: "72px", height: "72px", borderRadius: "36px", background: "linear-gradient(135deg, #eef2ff, #f4ecff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#6b7cc9", boxShadow: "0 10px 24px rgba(128, 136, 190, 0.18)" },
  loginLogoIcon: { width: "40px", height: "40px", color: "#6b7cc9" },
  loginBrand: { fontSize: "20px", fontWeight: 800, color: "#3a4766" },
  loginSub: { fontSize: "12px", color: "#9aa1b6" },
  loginRole: { display: "flex", gap: "10px", marginBottom: "12px" },
  loginFields: { display: "flex", flexDirection: "column", gap: "12px" },
  loginField: { display: "flex", flexDirection: "column", gap: "6px" },
  loginLabel: { fontSize: "12px", color: "#7b85a1", fontWeight: 700 },
  roleBtn: { flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #e8edf7", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#42506f" },
  roleBtnActive: { background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff" },
  loginHint: { fontSize: "12px", color: "#8a93ab", marginTop: "10px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #e8edf7", background: "#f9faff" },
  select: { width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #e8edf7", background: "#f9faff" },
  textarea: { width: "100%", minHeight: "80px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #e8edf7", background: "#f9faff" },
  inputDisabled: { opacity: 0.6, background: "#f5f0e7" },
  fieldRow: { display: "flex", gap: "10px", alignItems: "center" },
  fieldLabel: { width: "90px", fontWeight: 700, color: "#42506f" },
  fieldControl: { flex: 1 },
  primaryBtn: { padding: "10px 16px", background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 800, boxShadow: "0 8px 18px rgba(148, 170, 255, 0.25)" },
  primaryBtnMobile: { width: "100%", padding: "12px 16px", fontSize: "16px" },
  outlineBtn: { padding: "8px 12px", background: "#fff", color: "#4a5674", border: "1px solid #e8edf7", borderRadius: "12px", cursor: "pointer", fontWeight: 700 },
  dangerBtn: { padding: "8px 12px", background: "#ffe8ee", color: "#b23b3b", border: "1px solid #f3c7d4", borderRadius: "12px", cursor: "pointer", fontWeight: 700 },
  linkBtn: { border: "none", background: "transparent", color: "#6b7cc9", cursor: "pointer", fontWeight: 700 },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  scheduleControls: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  scheduleControlsMobile: { display: "flex", flexDirection: "column", alignItems: "stretch", gap: "10px" },
  toggleGroup: { display: "flex", gap: "6px", background: "#eff2fb", padding: "6px", borderRadius: "12px" },
  toggleGroupMobile: { display: "flex", gap: "6px", background: "#eff2fb", padding: "6px", borderRadius: "12px" },
  toggleBtn: { padding: "6px 12px", border: "none", borderRadius: "10px", cursor: "pointer", background: "transparent", fontWeight: 700, color: "#4a5674" },
  toggleActive: { background: "#fff", boxShadow: "0 4px 10px rgba(90, 70, 50, 0.15)" },
  weekNav: { display: "flex", gap: "8px" },
  weekNavMobile: { display: "flex", gap: "8px", justifyContent: "space-between" },
  dateStrip: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "72px", gap: "10px", overflowX: "auto", padding: "2px 2px 4px" },
  dateItem: { border: "1px solid #e8edf7", borderRadius: "12px", background: "#fff", padding: "8px 6px", textAlign: "center", color: "#4a5674" },
  dateItemActive: { background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff", border: "1px solid transparent" },
  dateLabelTop: { fontSize: "12px", fontWeight: 700 },
  dateLabelMid: { fontSize: "12px", marginTop: "4px" },
  weekScroller: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" },
  weekScrollerMobile: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(240px, 85vw)", gap: "12px", overflowX: "auto", paddingBottom: "4px" },
  weekDayCard: { background: "#fff", borderRadius: "16px", padding: "12px", border: "1px solid #edf1f7", display: "flex", flexDirection: "column", gap: "10px", minHeight: "200px" },
  weekDayTitle: { fontWeight: 800, color: "#4a5674" },
  dayHeader: { padding: "6px 0", fontWeight: 800, color: "#4a5674" },
  dayList: { display: "flex", flexDirection: "column", gap: "12px" },
  dayListMobile: { display: "flex", flexDirection: "column", gap: "14px" },
  courseCard: { borderRadius: "14px", overflow: "hidden", border: "1px solid #edf1f7", boxShadow: "0 10px 24px rgba(78, 90, 120, 0.10)", background: "#fff" },
  courseCardMobile: { borderRadius: "16px", boxShadow: "0 14px 30px rgba(78, 90, 120, 0.14)" },
  courseCardPast: { opacity: 0.6 },
  courseHeader: { padding: "12px", color: "#fff" },
  courseHeaderPast: { filter: "grayscale(0.2)", opacity: 0.8 },
  courseHeaderMobile: { padding: "14px" },
  courseTitle: { fontSize: "16px", fontWeight: 700 },
  courseTime: { fontSize: "12px" },
  courseBody: { padding: "12px", display: "flex", flexDirection: "column", gap: "8px" },
  courseBodyMobile: { padding: "14px", gap: "10px" },
  courseMobileMain: { display: "flex", gap: "12px", alignItems: "stretch", justifyContent: "space-between" },
  courseMobileLeft: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  courseMobileRight: { minWidth: "92px", display: "flex", alignItems: "center" },
  courseMobileTime: { fontSize: "18px", fontWeight: 800, color: "#3a4766" },
  courseMobileTitle: { fontSize: "16px", fontWeight: 800, color: "#3a4766" },
  courseMobileMeta: { fontSize: "12px", color: "#8a93ab" },
  starText: { color: "#f0b429", marginLeft: "6px" },
  courseRow: { display: "flex", justifyContent: "space-between", color: "#4a5674", fontSize: "13px", gap: "8px" },
  courseDesc: { fontSize: "12px", color: "#8a93ab" },
  courseFooter: { padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  courseFooterMobile: { padding: "14px", gap: "10px", flexDirection: "column", alignItems: "stretch" },
  courseActions: { display: "flex", gap: "8px" },
  smallNote: { fontSize: "12px", color: "#9aa1b6" },
  helperText: { fontSize: "13px", color: "#8a93ab" },
  infoRow: { display: "flex", gap: "14px", fontSize: "13px", color: "#8a93ab" },
  bookingCard: { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #edf1f7", padding: "12px", borderRadius: "14px", background: "#fff", boxShadow: "0 8px 18px rgba(78, 90, 120, 0.08)" },
  bookingCardPast: { opacity: 0.6, background: "#f7f8fb" },
  bookingInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  bookingTitle: { fontWeight: 700, color: "#3b2f1e" },
  bookingRow: { fontSize: "12px", color: "#7a6a55" },
  cardItem: { border: "1px solid #edf1f7", borderRadius: "14px", padding: "12px", background: "#fff", boxShadow: "0 8px 18px rgba(78, 90, 120, 0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  cardName: { fontWeight: 700, color: "#3b2f1e" },
  cardBody: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" },
  cardDetailList: { display: "grid", gap: "4px", fontSize: "12px", color: "#6b5b46" },
  cardActions: { display: "flex", gap: "8px", alignItems: "center" },
  cardGroup: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" },
  cardGroupHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "12px", background: "#f4f6ff", border: "1px solid #e8edf7" },
  cardGroupTitle: { fontWeight: 800, color: "#3a4766" },
  cardGroupSub: { fontSize: "12px", color: "#8a93ab" },
  cardGroupList: { display: "flex", flexDirection: "column", gap: "10px" },
  filterRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  filterBtn: { padding: "6px 12px", borderRadius: "10px", border: "1px solid #e8edf7", background: "#fff", color: "#4a5674", fontWeight: 700 },
  filterBtnActive: { background: "linear-gradient(120deg, #9bbaf7, #a8b4ff)", color: "#fff", border: "1px solid transparent" },
  adminRow: { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #edf1f7", padding: "12px", borderRadius: "12px", background: "#fff" },
  adminActions: { display: "flex", gap: "8px" },
  tag: { padding: "4px 8px", borderRadius: "10px", color: "#fff", fontSize: "12px" },
  divider: { height: "1px", background: "#edf1f7", margin: "6px 0" },
  empty: { padding: "12px", textAlign: "center", color: "#a2a9be", fontSize: "12px" },
  levelList: { display: "flex", gap: "10px", flexWrap: "wrap" },
  levelItem: { display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", color: "#4a5674" },
  mobileBottomNav: { display: "none" },
  mobileBottomItem: { display: "none" },
  mobileBottomItemActive: { display: "none" },
  mobileBottomIcon: { display: "none" },
  mobileBottomIconActive: { display: "none" },
  modalMask: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(13, 18, 33, 0.28)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, padding: "20px" },
  modalCard: { width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "18px", padding: "16px", boxShadow: "0 26px 50px rgba(13, 18, 33, 0.18)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontWeight: 800, color: "#3a4766" },
  closeBtn: { border: "none", background: "#eef2ff", padding: "6px 10px", borderRadius: "10px", cursor: "pointer", color: "#6b7cc9", fontWeight: 700 },
  modalBody: { display: "flex", flexDirection: "column", gap: "12px" },
  toast: { position: "fixed", top: "18px", right: "18px", padding: "10px 16px", background: "#9bbaf7", color: "#fff", borderRadius: "12px", boxShadow: "0 8px 20px rgba(78, 90, 120, 0.18)", zIndex: 999 },
};
export default App;
