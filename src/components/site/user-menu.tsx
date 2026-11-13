"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { name: string; avatarUrl: string | null; isStaff: boolean } | null;

/** Sign-in link or the member's name + sign out. Loaded client-side so pages stay cacheable. */
export function UserMenu({ labels }: { labels: { signIn: string; signOut: string; admin: string } }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user: Me }) => alive && setMe(d.user))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (me === undefined)
    return (
      <span
        className="inline-block h-4 w-16 animate-pulse rounded bg-black/10 on-hero:bg-white/20"
        aria-hidden="true"
      />
    );
  if (!me) {
    return (
      <Link
        href={`${pathname === "/km" || pathname.startsWith("/km/") ? "/km" : ""}/signin?next=${encodeURIComponent(pathname)}`}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[15px] text-black transition-colors hover:text-brand on-hero:text-white/90 on-hero:hover:text-white"
        data-testid="signin-link"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
        </svg>
        {labels.signIn}
      </Link>
    );
  }
  return (
    <span className="flex items-center gap-2" data-testid="user-menu">
      {me.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={me.avatarUrl} alt="" className="size-8 rounded-full" referrerPolicy="no-referrer" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-brand text-sm text-white" aria-hidden="true">
          {me.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="max-w-28 truncate text-[15px] text-black on-hero:text-white">{me.name}</span>
      {me.isStaff && (
        <Link href="/admin" className="text-sm text-brand hover:underline on-hero:text-white">
          {labels.admin}
        </Link>
      )}
      <form action="/auth/logout" method="post">
        <input type="hidden" name="next" value={pathname} />
        <button
          type="submit"
          className="text-sm text-muted transition-colors hover:text-brand on-hero:text-white/70 on-hero:hover:text-white"
        >
          {labels.signOut}
        </button>
      </form>
    </span>
  );
}
