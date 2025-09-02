import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  Link,
  useLoaderData,
  Form,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import "./tailwind.css";
import stylesHref from "~/styles/styles.css?url";
import notepadHref from "~/styles/notepad.css?url";
import { getSessionUser } from "~/utils/auth.server";
import { SearchIcon } from "~/components/icons";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesHref },
  { rel: "stylesheet", href: notepadHref },
];

type RootLoaderData = {
  user: { id: string; email: string } | null;
};

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  // Returns current session user for top nav
  const user = await getSessionUser(request);
  return json<RootLoaderData>({ user });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="app">
          <TopNav />
          <div aria-busy={isLoading} />
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function TopNav() {
  const data = useLoaderData<RootLoaderData>();
  return (
    <header className="topnav" role="banner" aria-label="App navigation">
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#e9d3a9" stroke="#b08a56" />
          <path d="M6 8h12M6 12h10M6 16h8" stroke="#5a4634" strokeWidth="1.5" />
        </svg>
        <Link to="/" className="no-underline" aria-label="Home">
          Notes
        </Link>
      </div>
      <Form method="get" action="/" className="search" role="search" aria-label="Search notes">
        <input
          type="search"
          name="q"
          placeholder="Search notes…"
          aria-label="Search notes"
          defaultValue={typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("q") ?? "" : ""}
        />
        <button className="btn" type="submit" aria-label="Search">
          <SearchIcon />
          Search
        </button>
      </Form>
      <div className="user">
        {data?.user ? (
          <>
            <span aria-label="User email">{data.user.email}</span>
            <Form method="post" action="/logout">
              <button className="btn" type="submit" aria-label="Log out">
                Log out
              </button>
            </Form>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" aria-label="Log in">Log in</Link>
            <Link to="/signup" className="btn" aria-label="Sign up">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return <Outlet />;
}
