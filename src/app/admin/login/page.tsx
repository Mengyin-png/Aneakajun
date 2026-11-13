import { redirect } from "next/navigation";
import { can } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const current = await getCurrentUser();
  if (current && can(current, "admin.access")) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-11 place-items-center rounded-xl bg-brand text-lg font-bold text-white"
          >
            A
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-ink">Aneakajun Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage content.</p>
        </div>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-xs text-muted">
          Accounts are created by a Super Admin. Public registration is disabled.
        </p>
      </div>
    </main>
  );
}
