/// <reference types="@cloudflare/workers-types" />

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(JSON.stringify(data), { ...init, headers });
};

const text = (data: string, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/plain");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(data, { ...init, headers });
};

const base64UrlEncode = (input: ArrayBuffer) => {
  const bytes = new Uint8Array(input);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const utf8 = (value: string) => new TextEncoder().encode(value);

const signHS256 = async (payload: Record<string, unknown>, secret: string) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = base64UrlEncode(utf8(JSON.stringify(header)).buffer);
  const encPayload = base64UrlEncode(utf8(JSON.stringify(payload)).buffer);
  const data = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, utf8(data));
  const encSig = base64UrlEncode(signature);
  return `${data}.${encSig}`;
};

const verifyHS256 = async (token: string, secret: string) => {
  const [encHeader, encPayload, encSig] = token.split(".");
  if (!encHeader || !encPayload || !encSig) return null;
  const data = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = Uint8Array.from(atob(encSig.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes, utf8(data));
  if (!ok) return null;
  const payloadJson = atob(encPayload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(payloadJson);
};

const hashPassword = async (password: string, salt: string) => {
  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: utf8(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return base64UrlEncode(bits);
};

const makePasswordHash = async (password: string) => {
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  return `pbkdf2$${salt}$${hash}`;
};

const verifyPassword = async (password: string, stored: string) => {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const salt = parts[1];
  const hash = parts[2];
  const check = await hashPassword(password, salt);
  return check === hash;
};

const generateTempPassword = (length = 12) => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let password = "";
  for (let i = 0; i < bytes.length; i += 1) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
};

const generateOtp = () => {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const value = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  const otp = Math.abs(value % 1000000).toString().padStart(6, "0");
  return otp;
};

const isPasswordValid = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

const sendOtpEmail = async (to: string, otp: string, env: Env) => {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    throw new Error("Email service not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [to],
      subject: "Your Sikhiya OTP",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err?.message || `Email failed (${res.status})`;
    throw new Error(message);
  }
};

const getBearerToken = (request: Request) => {
  const auth = request.headers.get("Authorization") || "";
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

const requireAdmin = async (request: Request, env: Env) => {
  const token = getBearerToken(request);
  if (!token) return { ok: false, error: json({ detail: "Authorization header required" }, { status: 401 }) };
  const payload = await verifyHS256(token, env.SECRET_KEY);
  if (!payload || payload.role !== "admin") {
    return { ok: false, error: json({ detail: "Admin access required" }, { status: 403 }) };
  }
  return { ok: true, payload };
};

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (url.pathname === "/") {
      return json({ status: "online", message: "Sikhiya Connect API is running" });
    }

    if (url.pathname === "/health") {
      return json({ status: "ok" });
    }

    if (url.pathname === "/register" && request.method === "POST") {
      const body = await request.json();
      const { name, email, password, role, board, student_class } = body || {};
      if (!name || !email || !password || !role) {
        return json({ detail: "Invalid request" }, { status: 400 });
      }

      if (!isPasswordValid(password)) {
        return json({ detail: "Password must be at least 8 characters and include letters and numbers" }, { status: 400 });
      }

      const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (existing) {
        return json({ detail: "Email already registered" }, { status: 400 });
      }

      const hashed = await makePasswordHash(password);
      const now = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO users (name, email, password, role, board, student_class, teacher_status) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(
          name,
          email,
          hashed,
          role,
          board ?? null,
          student_class ?? null,
          role === "teacher" ? "pending" : null
        )
        .run();

      return json({ message: "User registered" });
    }

    if (url.pathname === "/forgot-password" && request.method === "POST") {
      const body = await request.json();
      const { email } = body || {};
      if (!email) return json({ detail: "Email required" }, { status: 400 });

      const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
        .bind(email)
        .first();

      if (user) {
        const otp = generateOtp();
        const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await env.DB.prepare("UPDATE users SET reset_otp = ?, otp_expiry = ? WHERE id = ?")
          .bind(otp, expiry, (user as any).id)
          .run();

        if (env.DEV_OTP_RETURN === "true") {
          return json({ message: "OTP generated", otp });
        }

        try {
          await sendOtpEmail(email, otp, env);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Email delivery failed";
          return json({ detail: message }, { status: 502 });
        }
      }

      return json({ message: "OTP sent" });
    }

    if (url.pathname === "/verify-otp" && request.method === "POST") {
      const body = await request.json();
      const { email, otp } = body || {};
      if (!email || !otp) return json({ detail: "Email and OTP required" }, { status: 400 });

      const user = await env.DB.prepare("SELECT reset_otp, otp_expiry FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (!user || !(user as any).reset_otp) {
        return json({ detail: "Invalid OTP" }, { status: 400 });
      }

      const expiresAt = (user as any).otp_expiry ? new Date((user as any).otp_expiry).getTime() : 0;
      if (expiresAt && Date.now() > expiresAt) {
        return json({ detail: "OTP expired" }, { status: 400 });
      }

      if (String((user as any).reset_otp) !== String(otp)) {
        return json({ detail: "Invalid OTP" }, { status: 400 });
      }

      return json({ message: "OTP verified" });
    }

    if (url.pathname === "/reset-password" && request.method === "POST") {
      const body = await request.json();
      const { email, new_password } = body || {};
      if (!email || !new_password) return json({ detail: "Email and new password required" }, { status: 400 });

      if (!isPasswordValid(new_password)) {
        return json({ detail: "Password must be at least 8 characters and include letters and numbers" }, { status: 400 });
      }

      const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (!user) return json({ detail: "User not found" }, { status: 404 });

      const hashed = await makePasswordHash(new_password);
      await env.DB.prepare("UPDATE users SET password = ?, reset_otp = NULL, otp_expiry = NULL WHERE id = ?")
        .bind(hashed, (user as any).id)
        .run();

      return json({ message: "Password reset" });
    }

    if (url.pathname === "/login" && request.method === "POST") {
      const body = await request.json();
      const { email, password } = body || {};
      if (!email || !password) {
        return json({ detail: "Invalid credentials" }, { status: 401 });
      }

      if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
        const token = await signHS256({ user_id: 0, email, role: "admin" }, env.SECRET_KEY);
        return json({
          access_token: token,
          token_type: "bearer",
          user: {
            id: "admin-001",
            name: env.ADMIN_NAME,
            email,
            role: "admin",
          },
        });
      }

      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (!user) {
        return json({ detail: "Invalid credentials" }, { status: 401 });
      }

      const ok = await verifyPassword(password, user.password as string);
      if (!ok) {
        return json({ detail: "Invalid credentials" }, { status: 401 });
      }

      const token = await signHS256(
        { user_id: user.id, email: user.email, role: user.role },
        env.SECRET_KEY
      );

      return json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          board: user.board,
          student_class: user.student_class,
          teacherStatus: user.teacher_status,
        },
      });
    }

    if (url.pathname === "/me" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });

      if (payload.role === "admin") {
        return json({
          user: {
            id: "admin-001",
            name: env.ADMIN_NAME,
            email: env.ADMIN_EMAIL,
            role: "admin",
          },
        });
      }

      const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
        .bind(payload.user_id)
        .first();
      if (!user) return json({ detail: "User not found" }, { status: 401 });

      return json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          board: user.board,
          student_class: user.student_class,
          teacherStatus: user.teacher_status,
        },
      });
    }

    if (url.pathname === "/dashboard" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });

      if (payload.role === "teacher") {
        return json({ detail: "Teacher dashboard is not available here" }, { status: 403 });
      }

      const userId = Number(payload.user_id);

      const statsRow = await env.DB.prepare(
        "SELECT COUNT(*) AS courses_enrolled, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_courses FROM student_enrollments WHERE student_id = ?"
      )
        .bind(userId)
        .first();

      const watchedRow = await env.DB.prepare(
        "SELECT COALESCE(SUM(watched_seconds), 0) AS watched_seconds FROM lesson_progress WHERE student_id = ?"
      )
        .bind(userId)
        .first();

      const progressRows = await env.DB.prepare(
        "SELECT c.id AS course_id, COUNT(cl.id) AS total_lessons, SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END) AS completed_lessons "
        + "FROM courses c "
        + "JOIN student_enrollments se ON se.course_id = c.id AND se.student_id = ? "
        + "LEFT JOIN course_modules cm ON cm.course_id = c.id "
        + "LEFT JOIN course_lessons cl ON cl.module_id = cm.id "
        + "LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.student_id = ? "
        + "GROUP BY c.id"
      )
        .bind(userId, userId)
        .all();

      const courseProgress: Record<string, number> = {};
      for (const row of progressRows.results || []) {
        const total = Number((row as any).total_lessons || 0);
        const completed = Number((row as any).completed_lessons || 0);
        courseProgress[String((row as any).course_id)] = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      const hoursLearned = Number((watchedRow as any)?.watched_seconds || 0) / 3600;

      return json({
        stats: {
          coursesEnrolled: Number((statsRow as any)?.courses_enrolled || 0),
          hoursLearned: Math.round(hoursLearned * 10) / 10,
          currentStreak: 0,
          completedCourses: Number((statsRow as any)?.completed_courses || 0),
        },
        courseProgress,
      });
    }

    if (url.pathname === "/student/enrollments" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });

      const userId = Number(payload.user_id);

      const result = await env.DB.prepare(
        "SELECT c.id, c.title, c.description, c.level, c.duration_hours, c.thumbnail, c.target_class, c.target_board, u.name AS teacher_name, "
        + "(SELECT COUNT(*) FROM student_enrollments se2 WHERE se2.course_id = c.id) AS student_count "
        + "FROM student_enrollments se "
        + "JOIN courses c ON c.id = se.course_id "
        + "JOIN users u ON u.id = c.teacher_id "
        + "WHERE se.student_id = ?"
      )
        .bind(userId)
        .all();

      const courses = (result.results || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        duration: c.duration_hours,
        thumbnail: c.thumbnail,
        target_class: c.target_class,
        target_board: c.target_board,
        teacherName: c.teacher_name,
        studentCount: c.student_count,
      }));

      return json({ courses });
    }

    if (url.pathname === "/teacher/dashboard" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });
      if (payload.role !== "teacher") return json({ detail: "Teacher access required" }, { status: 403 });

      const teacherId = Number(payload.user_id);

      const statsRow = await env.DB.prepare(
        "SELECT COUNT(*) AS total_courses FROM courses WHERE teacher_id = ?"
      )
        .bind(teacherId)
        .first();

      const enrollRow = await env.DB.prepare(
        "SELECT COUNT(*) AS total_enrollments, COUNT(DISTINCT se.student_id) AS total_students "
        + "FROM student_enrollments se "
        + "JOIN courses c ON c.id = se.course_id "
        + "WHERE c.teacher_id = ?"
      )
        .bind(teacherId)
        .first();

      return json({
        stats: {
          totalCourses: Number((statsRow as any)?.total_courses || 0),
          totalStudents: Number((enrollRow as any)?.total_students || 0),
          totalEnrollments: Number((enrollRow as any)?.total_enrollments || 0),
        },
        weeklyEnrollments: [],
        questions: [],
      });
    }

    if (url.pathname === "/teacher/courses" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });
      if (payload.role !== "teacher") return json({ detail: "Teacher access required" }, { status: 403 });

      const teacherId = Number(payload.user_id);

      const result = await env.DB.prepare(
        "SELECT c.id, c.title, c.description, c.level, c.duration_hours, c.thumbnail, c.target_class, c.target_board, "
        + "(SELECT COUNT(*) FROM student_enrollments se WHERE se.course_id = c.id) AS student_count "
        + "FROM courses c WHERE c.teacher_id = ? ORDER BY c.id DESC"
      )
        .bind(teacherId)
        .all();

      const courses = (result.results || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        duration: c.duration_hours,
        thumbnail: c.thumbnail,
        target_class: c.target_class,
        target_board: c.target_board,
        studentCount: c.student_count,
        modules: [],
      }));

      return json({ courses });
    }

    if (url.pathname === "/courses/available" && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });

      const result = await env.DB.prepare(
        "SELECT c.id, c.title, c.description, c.level, c.duration_hours, c.thumbnail, c.target_class, c.target_board, u.name AS teacher_name, "
        + "(SELECT COUNT(*) FROM student_enrollments se2 WHERE se2.course_id = c.id) AS student_count "
        + "FROM courses c JOIN users u ON u.id = c.teacher_id ORDER BY c.id DESC"
      ).all();

      const courses = (result.results || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        duration: c.duration_hours,
        thumbnail: c.thumbnail,
        target_class: c.target_class,
        target_board: c.target_board,
        teacherName: c.teacher_name,
        studentCount: c.student_count,
      }));

      return json({ courses });
    }

    if (url.pathname.match(/^\/courses\/\d+$/) && request.method === "GET") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });

      const courseId = Number(url.pathname.split("/")[2]);
      if (!Number.isFinite(courseId)) {
        return json({ detail: "Invalid course id" }, { status: 400 });
      }

      const course = await env.DB.prepare(
        "SELECT c.id, c.title, c.description, c.level, c.duration_hours, c.thumbnail, c.target_class, c.target_board, u.name AS teacher_name, "
        + "(SELECT COUNT(*) FROM student_enrollments se2 WHERE se2.course_id = c.id) AS student_count "
        + "FROM courses c JOIN users u ON u.id = c.teacher_id WHERE c.id = ?"
      )
        .bind(courseId)
        .first();

      if (!course) return json({ detail: "Course not found" }, { status: 404 });

      return json({
        course: {
          id: (course as any).id,
          title: (course as any).title,
          description: (course as any).description,
          level: (course as any).level,
          duration: (course as any).duration_hours,
          thumbnail: (course as any).thumbnail,
          target_class: (course as any).target_class,
          target_board: (course as any).target_board,
          teacherName: (course as any).teacher_name,
          studentCount: (course as any).student_count,
          modules: [],
        },
      });
    }

    if (url.pathname.match(/^\/courses\/\d+\/enroll$/) && request.method === "POST") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });
      if (payload.role === "teacher") return json({ detail: "Students only" }, { status: 403 });

      const courseId = Number(url.pathname.split("/")[2]);
      if (!Number.isFinite(courseId)) {
        return json({ detail: "Invalid course id" }, { status: 400 });
      }

      const existing = await env.DB.prepare(
        "SELECT id FROM student_enrollments WHERE student_id = ? AND course_id = ?"
      )
        .bind(payload.user_id, courseId)
        .first();
      if (existing) return json({ message: "Already enrolled" });

      await env.DB.prepare(
        "INSERT INTO student_enrollments (student_id, course_id, enrolled_at, status) VALUES (?, ?, datetime('now'), 'active')"
      )
        .bind(payload.user_id, courseId)
        .run();

      return json({ message: "Enrolled" });
    }

    if (url.pathname.match(/^\/courses\/\d+\/unenroll$/) && request.method === "POST") {
      const token = getBearerToken(request);
      if (!token) return json({ detail: "Authorization header required" }, { status: 401 });
      const payload = await verifyHS256(token, env.SECRET_KEY);
      if (!payload?.user_id) return json({ detail: "Invalid token" }, { status: 401 });
      if (payload.role === "teacher") return json({ detail: "Students only" }, { status: 403 });

      const courseId = Number(url.pathname.split("/")[2]);
      if (!Number.isFinite(courseId)) {
        return json({ detail: "Invalid course id" }, { status: 400 });
      }

      await env.DB.prepare(
        "DELETE FROM student_enrollments WHERE student_id = ? AND course_id = ?"
      )
        .bind(payload.user_id, courseId)
        .run();

      return json({ message: "Unenrolled" });
    }

    if (url.pathname === "/admin/students" && request.method === "GET") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const result = await env.DB.prepare(
        "SELECT id, name, email, role, board, student_class FROM users WHERE role IN ('student','user')"
      ).all();

      const students = (result.results || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        board: s.board,
        student_class: s.student_class,
        avatar: s.name ? String(s.name)[0].toUpperCase() : "?",
      }));

      return json({ students });
    }

    if (url.pathname === "/admin/teachers" && request.method === "GET") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const status = url.searchParams.get("status");
      let query = "SELECT id, name, email, role, teacher_status FROM users WHERE role = 'teacher'";
      const params: any[] = [];
      if (status) {
        query += " AND teacher_status = ?";
        params.push(status);
      }

      const result = await env.DB.prepare(query).bind(...params).all();
      const teachers = (result.results || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: t.role,
        teacherStatus: t.teacher_status,
        avatar: t.name ? String(t.name)[0].toUpperCase() : "?",
        bio: null,
        qualifications: null,
      }));

      return json({ teachers });
    }

    if (url.pathname.match(/^\/admin\/teachers\/\d+\/approve$/) && request.method === "POST") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const teacherId = Number(url.pathname.split("/")[3]);
      if (!Number.isFinite(teacherId)) {
        return json({ detail: "Invalid teacher id" }, { status: 400 });
      }

      const teacher = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'")
        .bind(teacherId)
        .first();
      if (!teacher) {
        return json({ detail: "Teacher not found" }, { status: 404 });
      }

      await env.DB.prepare("UPDATE users SET teacher_status = 'approved' WHERE id = ?")
        .bind(teacherId)
        .run();
      return json({ message: "Teacher approved" });
    }

    if (url.pathname.match(/^\/admin\/teachers\/\d+\/reject$/) && request.method === "POST") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const teacherId = Number(url.pathname.split("/")[3]);
      if (!Number.isFinite(teacherId)) {
        return json({ detail: "Invalid teacher id" }, { status: 400 });
      }

      const teacher = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'")
        .bind(teacherId)
        .first();
      if (!teacher) {
        return json({ detail: "Teacher not found" }, { status: 404 });
      }

      await env.DB.prepare("UPDATE users SET teacher_status = 'rejected' WHERE id = ?")
        .bind(teacherId)
        .run();
      return json({ message: "Teacher rejected" });
    }

    if (url.pathname.match(/^\/admin\/users\/\d+\/reset-password$/) && request.method === "POST") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const userId = Number(url.pathname.split("/")[3]);
      if (!Number.isFinite(userId)) {
        return json({ detail: "Invalid user id" }, { status: 400 });
      }

      const user = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?")
        .bind(userId)
        .first();
      if (!user) {
        return json({ detail: "User not found" }, { status: 404 });
      }
      if (user.role === "admin") {
        return json({ detail: "Cannot reset admin password" }, { status: 400 });
      }

      const temporaryPassword = generateTempPassword();
      const hashed = await makePasswordHash(temporaryPassword);
      await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?")
        .bind(hashed, userId)
        .run();

      return json({ message: "Password reset", temporaryPassword });
    }

    if (url.pathname.startsWith("/admin/users/") && request.method === "DELETE") {
      const adminCheck = await requireAdmin(request, env);
      if (!adminCheck.ok) return adminCheck.error;

      const userId = Number(url.pathname.split("/").pop());
      if (!Number.isFinite(userId)) {
        return json({ detail: "Invalid user id" }, { status: 400 });
      }

      const user = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?")
        .bind(userId)
        .first();
      if (!user) {
        return json({ detail: "User not found" }, { status: 404 });
      }
      if (user.role === "admin") {
        return json({ detail: "Cannot delete admin user" }, { status: 400 });
      }

      if (user.role === "teacher") {
        const courses = await env.DB.prepare("SELECT id FROM courses WHERE teacher_id = ?")
          .bind(userId)
          .all();

        for (const course of courses.results) {
          const courseId = course.id as number;

          await env.DB.prepare(
            "DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM course_lessons WHERE module_id IN (SELECT id FROM course_modules WHERE course_id = ?))"
          ).bind(courseId).run();

          await env.DB.prepare("DELETE FROM course_resources WHERE course_id = ?").bind(courseId).run();
          await env.DB.prepare("DELETE FROM course_lessons WHERE module_id IN (SELECT id FROM course_modules WHERE course_id = ?)")
            .bind(courseId)
            .run();
          await env.DB.prepare("DELETE FROM course_modules WHERE course_id = ?").bind(courseId).run();
          await env.DB.prepare("DELETE FROM student_enrollments WHERE course_id = ?").bind(courseId).run();
          await env.DB.prepare("DELETE FROM courses WHERE id = ?").bind(courseId).run();
        }
      }

      await env.DB.prepare("DELETE FROM student_enrollments WHERE student_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM lesson_progress WHERE student_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

      return json({ message: "User deleted" });
    }

    return text("Not Found", { status: 404 });
  },
};

export interface Env {
  DB: D1Database;
  SECRET_KEY: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_NAME: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
}
