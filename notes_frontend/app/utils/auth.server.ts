import { redirect } from "@remix-run/node";

/**
 * Simple cookie-less demo auth using URL session token in localStorage fallback.
 * For production, integrate with a real backend/session storage.
 */

const SESSION_COOKIE = "demo_session_user";

/**
 * PUBLIC_INTERFACE
 * Read current session user from cookie header; falls back to null.
 */
export async function getSessionUser(request: Request): Promise<{ id: string; email: string } | null> {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    if (user && user.id && user.email) return user;
  } catch {
    // malformed cookie; treat as not authenticated
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Create a session cookie and redirect.
 */
export async function createUserSession(email: string, redirectTo = "/") {
  const user = { id: `u_${Buffer.from(email).toString("base64")}`, email };
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

/**
 * PUBLIC_INTERFACE
 * Destroy the session cookie and redirect.
 */
export async function logout() {
  return redirect("/login", {
    headers: {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0`,
    },
  });
}

/**
 * PUBLIC_INTERFACE
 * Require user or redirect to login.
 */
export async function requireUser(request: Request) {
  const user = await getSessionUser(request);
  if (!user) throw redirect("/login");
  return user;
}
