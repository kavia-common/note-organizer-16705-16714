import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { createUserSession, getSessionUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => ([
  { title: "Log in — Notepad" },
  { name: "description", content: "Log in to your notepad" },
]);

// PUBLIC_INTERFACE
/** Loader: If already logged in, redirect to home. */
export async function loader({ request }: { request: Request }) {
  const user = await getSessionUser(request);
  if (user) {
    return new Response("", { status: 302, headers: { Location: "/" } });
  }
  return null;
}

// PUBLIC_INTERFACE
/** Action: Log in using an email (demo auth). */
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }
  // demo-only: accept any email/password
  return createUserSession(email, "/");
}

export default function Login() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const errorMsg = (actionData as { error?: string } | undefined)?.error;
  return (
    <main className="paper-wrap" role="main">
      <div className="auth-card" role="region" aria-label="Login form">
        <h1>Log in</h1>
        <p style={{ color: "var(--ink-secondary)", marginTop: 0, marginBottom: 12 }}>
          Use any email and password (demo).
        </p>
        {errorMsg && <div className="error" role="alert">{errorMsg}</div>}
        <Form method="post" replace>
          <label className="label-sr" htmlFor="email">Email</label>
          <input id="email" className="input" name="email" type="email" placeholder="you@example.com" required />
          <label className="label-sr" htmlFor="password">Password</label>
          <input id="password" className="input" name="password" type="password" placeholder="••••••••" required />
          <button className="btn" type="submit" aria-label="Log in" disabled={nav.state !== "idle"}>
            Log in
          </button>
        </Form>
        <div style={{ marginTop: 12 }}>
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </main>
  );
}
