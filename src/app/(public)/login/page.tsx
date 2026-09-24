import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your VACAY Florence account to access priority tickets, itineraries, and vouchers.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
}) {
  const { redirectTo, reset } = await searchParams;

  return (
    <AuthCard
      activeTab="login"
      title="Welcome back"
      subtitle="Sign in to your account"
    >
      <LoginForm
        redirectTo={redirectTo ?? "/account"}
        resetNotice={reset ? "Password updated — sign in with your new password." : undefined}
      />
    </AuthCard>
  );
}
