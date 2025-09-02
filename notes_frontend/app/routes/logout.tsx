import { logout } from "~/utils/auth.server";

// PUBLIC_INTERFACE
/** Action-only route to clear the demo session cookie and redirect to login. */
export async function action() {
  return logout();
}

export default function Logout() {
  return null;
}
